import { Observable, Subject, Subscription } from 'rxjs';
import { Platform } from 'ionic-angular';
import {
  CameraPreview,
  CameraPreviewOptions
} from '@ionic-native/camera-preview';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

type TScreenOrientation = 'LANDSCAPE' | 'PORTRAIT';

export class CameraPreviewEnhanced {
  private _cameraPreviewOpts: CameraPreviewOptions = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
    camera: 'back',
    toBack: true,
    tapPhoto: false,
    previewDrag: false,
    alpha: 1
  }
  private _ionApp: HTMLElement;
  private _scrollContentEl: HTMLElement;
  private _shootBtnEl: HTMLElement;
  private _backBtnEl: HTMLElement;
  private _cameraRectEl: HTMLElement;

  private _isRunning: boolean = false;
  private _onTakePictureSubj: Subject<any>;
  private _onTakePicture$: Observable<any>;
  private _onScreenChangeSubs: Subscription;

  constructor(
    private _cameraPreview: CameraPreview,
    private _screenOrientation: ScreenOrientation,
    private _plt: Platform
  ) {
    this._ionApp = document.querySelector('ion-app');
    this._scrollContentEl = document.querySelector('test-enquiry-form ion-content .scroll-content');
    this._onTakePictureSubj = new Subject();
    this._onTakePicture$ = this._onTakePictureSubj.asObservable();

    this.init();
  }

  public onTakePicture() {
    return this._onTakePicture$;
  }

  init() {
    const screenOrientation: TScreenOrientation = this._plt.isPortrait() ? 'PORTRAIT' : 'LANDSCAPE';
    this.startCamera(screenOrientation);
  }

  initHtml(screenOrientation: TScreenOrientation) {
    this._ionApp.style.visibility = 'hidden';
    this._scrollContentEl.style.overflowY = 'hidden'; // why scroll-container is visible when hiding ionApp???

    this.initElements(screenOrientation);
  }


  initElements(screenOrientation: TScreenOrientation) {
    const that = this;

    const orientationClassName = screenOrientation.toLowerCase();

    this._shootBtnEl = document.createElement('div');
    this._shootBtnEl.className = `camera-shoot-btn ${orientationClassName}`;
    this._shootBtnEl.addEventListener('click', function() {
      that.takePicture();
    });

    this._backBtnEl = document.createElement('div');
    this._backBtnEl.className = `camera-back-btn ${orientationClassName}`;
    this._backBtnEl.addEventListener('click', function() {
      that.killCamera();
    })

    this._cameraRectEl = document.createElement('div');
    this._cameraRectEl.className = `camera-rect ${orientationClassName}`;

    document.body.appendChild(this._shootBtnEl);
    document.body.appendChild(this._backBtnEl);
    document.body.appendChild(this._cameraRectEl);
  }

  destroyElements() {
    this._shootBtnEl.remove();
    this._backBtnEl.remove();
    this._cameraRectEl.remove();
  }

  startCamera(screenOrientation: TScreenOrientation, width?: number, height?: number) {
    const widthAdjusted = (screenOrientation === 'LANDSCAPE') ?
        (this._plt.is('android') ? window.screen.width : window.screen.height) :
        (this._plt.is('ios') ? window.screen.height : window.screen.height);
    const heightAdjusted = (screenOrientation === 'LANDSCAPE') ?
        (this._plt.is('android') ? window.screen.height : window.screen.width) :
        this._plt.is('ios') ? window.screen.width : window.screen.width;

    this._cameraPreview.startCamera({
      x: 0,
      y: 0,
      width: widthAdjusted,
      height: heightAdjusted,
      camera: 'back',
      toBack: true,
      tapPhoto: false,
      previewDrag: false,
      alpha: 1
    }).then(
      (res) => {
        this._screenOrientation.lock(this._screenOrientation.ORIENTATIONS.LANDSCAPE).then(
          () => {
            console.log('#startCamera!', res);
            this.initHtml(screenOrientation);
            this._isRunning = true;
          },
          (err) => {
            console.warn('"screenOrientation.lock" error:', err);
          }
        )
      },
      (err) => {
        console.warn('"cameraPreview.startCamera" error:', err);
      });
  }

  destroy() {
    this.destroyElements();
    this._ionApp.style.visibility = null;
    this._scrollContentEl.style.overflowY = 'scroll';
    this._screenOrientation.unlock()
  }

  takePicture() {
    this._cameraPreview.takePicture().then(
      (res) => {
        console.log('takePicture res', res);
        this._onTakePictureSubj.next(res);
        this._cameraPreview.stopCamera().then(
          (resStop) => {
            console.log('stopCamera res', resStop);
            this.destroy();
          }
        );
      },
      (err) => {
        console.log('takepicture err', err);
      }
    );
  }

  killCamera() {
    this._cameraPreview.stopCamera().then(
      (res) => {
        console.log('stopCamera res', res);
        this.destroy();
      }
    )
  }

  parseScreenOrientation(value: string): TScreenOrientation {
    return value.includes('landscape') ? 'LANDSCAPE' : 'PORTRAIT';
  }
}
