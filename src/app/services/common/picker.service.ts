import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

export enum ImageSource {
  CAMERA,
  GALLERY,
  ASK
}

export enum FileType {
  VIDEO,
  DOCUMENT
}

@Injectable({
  providedIn: 'root'
})
export class PickerService {
  private pickerPromiseResolve;
  private pickerPromiseReject;

  constructor(private platform: Platform, private translateService: TranslateService, private alertCtrl: AlertController) { }

  pickFile(fileType: FileType) {
    const component = this;
    this.platform.ready().then(() => {
      if (this.platform.is("android")) {
        (<any>window).fileChooser.open({ "mime": (fileType == FileType.VIDEO ? "video/mp4" : "application/*") }, (uri) => component.pickerPromiseResolve(uri), (err) => { console.log("fileChooser", err); this.pickerPromiseReject("something_wrong"); }); // with mime filter
      } else {
        (<any>window).FilePicker.pickFile((uri) => component.pickerPromiseResolve(uri), (err) => { console.log("fileChooser", err); this.pickerPromiseReject("something_wrong"); }, (fileType == FileType.VIDEO ? "public.movie" : "public.data"));
      }
    });
    return new Promise((resolve, reject) => {
      component.pickerPromiseResolve = resolve;
      component.pickerPromiseReject = reject;
    });
  }

  pickImage(imageSource: ImageSource) {
    if (imageSource == ImageSource.CAMERA) {
      this.getImageCamera();
    } else if (imageSource == ImageSource.GALLERY) {
      this.getImageGallery();
    } else {
      this.translateService.get(["image_pic_header", "image_pic_subheader", "image_pic_camera", "image_pic_gallery"]).subscribe(values => {
        this.alertCtrl.create({
          header: values["image_pic_header"],
          message: values["image_pic_subheader"],
          buttons: [{
            text: values["image_pic_camera"],
            handler: () => this.getImageCamera()
          }, {
            text: values["image_pic_gallery"],
            handler: () => this.getImageGallery()
          }]
        }).then(alert => alert.present());
      });
    }

    const component = this;
    return new Promise((resolve, reject) => {
      component.pickerPromiseResolve = resolve;
      component.pickerPromiseReject = reject;
    });
  }

  private getImageCamera() {
    // const options: CameraOptions = {
    //   quality: 75,
    //   destinationType: this.platform.is("android") ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.NATIVE_URI,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   mediaType: this.camera.MediaType.PICTURE
    // }
    // this.camera.getPicture(options).then((imageData) => this.reduceImages(imageData), (err) => {
    //   console.log("getPicture", JSON.stringify(err));
    //   this.pickerPromiseReject("camera_err");
    // });

    (<any>navigator).camera.getPicture((imageData) => this.reduceImages(imageData), (err) => {
      console.log("getPicture", JSON.stringify(err));
      this.pickerPromiseReject("camera_err");
    }, { quality: 75, destinationType: this.platform.is("android") ? 1 : 2, encodingType: 0, mediaType: 0, correctOrientation: true, targetWidth: 512, targetHeight: 512 });
  }

  private getImageGallery() {
    const component = this;
    this.platform.ready().then(() => {
      if (this.platform.is("android")) {
        //{ "mime": "application/pdf" }  // text/plain, image/png, image/jpeg, audio/wav etc
        //(<any>window).fileChooser.open({ "mime": component.uploadType == 1 ? "image/jpeg" : "application/*" }, (uri) => component.resolveUri(uri), (err) => console.log("fileChooser", err)); // with mime filter
        (<any>window).fileChooser.open({ "mime": "image/*" }, (uri) => component.reduceImages(uri), (err) => { console.log("fileChooser", err); this.pickerPromiseReject("something_wrong"); }); // with mime filter
      } else {
        let gpr = { maximumImagesCount: 1, disable_popover: 1 };
        (<any>window).imagePicker.getPictures((results) => {
          if (results && results[0]) this.reduceImages(results[0]); else this.pickerPromiseReject("something_wrong");
        }, (err) => {
          console.log("getPictures", JSON.stringify(err));
          this.pickerPromiseReject("something_wrong");
        }, gpr);
      }
    });
  }

  private reduceImages(selected_pictures: string) {
    // return selected_pictures.reduce((promise: any, item: any) => {
    //   return promise.then((result) => {
    //     return this.cropService.crop(item, { quality: 100 }).then(cropped_image => this.uploadImage(cropped_image));
    //   });
    // }, Promise.resolve());
    (<any>window).plugins.crop.promise(selected_pictures, { quality: 100 }).then(cropped_image => this.pickerPromiseResolve(cropped_image)).catch(err => { console.log("crop", err); this.pickerPromiseReject("something_wrong"); });
  }
}
