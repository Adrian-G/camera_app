import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { CameraPreview } from '@ionic-native/camera-preview';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { CameraPreviewEnhanced } from '../../utils/CameraPreviewEnhanced';

@Component({
  selector: 'test-enquiry-form',
  templateUrl: './enquiry-form.html',
})
export class EnquiryFormPage {
  imageBase64: string;

  constructor(
    private cameraPreview: CameraPreview,
    private screenOrientation: ScreenOrientation,
    private plt: Platform
  ) {}

  onClickTakePhotoBtn() {
    const cameraPreviewEnhanced = new CameraPreviewEnhanced(this.cameraPreview, this.screenOrientation, this.plt);
    cameraPreviewEnhanced.onTakePicture().subscribe(
      (next) => {
        console.log('onTakePicture next', next);
        this.imageBase64 = `data:image/png;base64,${next}`;
      },
      (err) => {
        console.warn('onTakePicture error', err);
      }
    );
  }
}
