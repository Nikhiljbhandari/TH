import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';

import { FirebaseService } from '../services/firebase.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { LoadingController, ToastController, AlertController, ActionSheetController, Platform } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import * as jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import { File, IWriteOptions, FileEntry } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';

const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {


  image: any;
  item: any;
  load: boolean = false;
  loading: any;
  peopleDetails: any;
  images = [];

  constructor(
    private imagePicker: ImagePicker,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private firebaseService: FirebaseService,
    private webview: WebView,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private file: File,
      private fileOpener: FileOpener,
      private camera: Camera,
    private actionSheetController: ActionSheetController,
                                         private storage: Storage,
                                          private plt: Platform,
                                         private ref: ChangeDetectorRef, private filePath: FilePath

  ) { }

  ngOnInit() {
    this.plt.ready().then(() => {
          //this.loadStoredImages();
        });
    if (this.route && this.route.data) {
      this.getData();
    }
  }

  async getData(){
    this.route.data.subscribe(routeData => {
      //this.item = routeData['data'].peopleEvent;
      routeData['data'].subscribe(data => {
        this.item = data[0].payload.doc.data();
        this.item.id = data[0].payload.doc.id;
        //this.item = data;
        this.firebaseService.getPeopleDetails()
                  .then(data1 => {
                    data1.subscribe(data2 => {
                  this.peopleDetails = data2;
                  })
                    },
                   err => {

        })
      })
    })
  }

  /*async presentLoading(msg) {
    const loading = await this.loadingController.create({
      message: msg
    });
    return await loading.present();
  }*/

  exportPdf() {
    //this.presentLoading('Creating PDF file...');
    const div = document.getElementById("printable-area");
    const options = { background: "white", height: div.clientWidth, width: div.clientHeight };
    domtoimage.toPng(div, options).then((dataUrl)=> {
      //Initialize JSPDF
      var doc = new jsPDF("p","mm","a4");
      //Add image Url to PDF
      doc.addImage(dataUrl, 'PNG', 20, 20, 240, 180);

      let pdfOutput = doc.output();
      // using ArrayBuffer will allow you to put image inside PDF
      let buffer = new ArrayBuffer(pdfOutput.length);
      let array = new Uint8Array(buffer);
      for (var i = 0; i < pdfOutput.length; i++) {
          array[i] = pdfOutput.charCodeAt(i);
      }


      //This is where the PDF file will stored , you can change it as you like
      // for more information please visit https://ionicframework.com/docs/native/file/
      const directory = this.file.dataDirectory ;
      const fileName = this.peopleDetails[0].payload.doc.data().name+"_"+Date.now()+".pdf";
      let options: IWriteOptions = { replace: true };

      this.file.checkFile(directory, fileName).then((success)=> {
        //Writing File to Device
        this.file.writeFile(directory,fileName,buffer, options)
        .then((success)=> {
          this.loading.dismiss();
          console.log("File created Succesfully" + JSON.stringify(success));
          this.fileOpener.open(this.file.dataDirectory + fileName, 'application/pdf')
            .then(() => console.log('File is opened'))
            .catch(e => console.log('Error opening file', e));
        })
        .catch((error)=> {
          //this.loading.dismiss();
          console.log("Cannot Create File " +JSON.stringify(error));
        });
      })
      .catch((error)=> {
        //Writing File to Device
        this.file.writeFile(directory,fileName,buffer)
        .then((success)=> {
        //  this.loading.dismiss();
          console.log("File created Succesfully" + JSON.stringify(success));
          this.fileOpener.open(this.file.dataDirectory + fileName, 'application/pdf')
            .then(() => console.log('File is opened'))
            .catch(e => console.log('Error opening file', e));
        })
        .catch((error)=> {
      //    this.loading.dismiss();
          console.log("Cannot Create File " +JSON.stringify(error));
        });
      });
    })
    .catch(function (error) {
      //this.loading.dismiss();
      console.error('oops, something went wrong!', error);
    });
  }

  onSubmit(value){
    let data = {
      title: value.title,
      description: value.description,
      image: this.image
    }
    /*this.firebaseService.updateTask(this.item.id,data)
    .then(
      res => {
        this.router.navigate(["/home"]);
      }
    )*/
  }

  async finish() {
    const alert = await this.alertCtrl.create({
          header: 'Confirm',
          message: 'Do you want to finish ' + this.item.eventName + '?',
          buttons: [
            {
              text: 'No',
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {}
            },
            {
              text: 'Yes',
              handler: () => {
                this.item.endAt = Date.now();
                this.firebaseService.updateEvent(this.item.id, this.item)
                .then(
                  res => {
                    //this.router.navigate(["/home"]);
                  },
                  err => console.log(err)
                )
              }
            }
          ]
        });
        await alert.present();
  }

  createFileName(clueName) {
      var d = new Date(),
          n = d.getTime(),
          newFileName = n + ".jpg";
      return this.peopleDetails[0].payload.doc.data().name+"_"+clueName+"_"+Date.now()+".jpg";
  }

  async presentToast(text) {
      const toast = await this.toastCtrl.create({
          message: text,
          position: 'bottom',
          duration: 3000
      });
      toast.present();
    }

  copyFileToLocalDir(namePath, currentName, newFileName, imagePath, clue) {
      console.log(namePath + '  namePath');
            console.log(currentName + '  currentName');
            console.log(newFileName + '  newFileName');
            console.log(this.file + '  this.file');

      this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
          this.updateStoredImages(newFileName, imagePath, clue);
      }, error => {
          this.presentToast('Error while storing file.');
      });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  updateStoredImages(name, imagePath, clue) {
    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
          let newImages = [name];
          this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
          arr.push(name);
          this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
          name: name,
          path: resPath,
          filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      clue.localImageURL = resPath;
      this.uploadImageToFirebase(imagePath, clue);
      this.ref.detectChanges(); // trigger change detection cycle
    });
  }

  async selectImage(clue) {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
              text: 'Load from Library',
              handler: () => {
                  this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, clue);
              }
          },
          {
              text: 'Use Camera',
              handler: () => {
                  this.takePicture(this.camera.PictureSourceType.CAMERA, clue);
              }
          },
          {
              text: 'Cancel',
              role: 'cancel'
          }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType, clue: any) {
    var options: CameraOptions = {
        quality: 100,
        sourceType: sourceType,
        saveToPhotoAlbum: true,
        correctOrientation: true
    };
    this.camera.getPicture(options).then(imagePath => {
      if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
              let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
              let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
              this.copyFileToLocalDir(correctPath, currentName, this.createFileName(clue.name), imagePath, clue);
              //this.uploadImageToFirebase(imagePath, clue);
          });
      } else {
        console.log(imagePath + 'imagePath');
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName(clue.name), imagePath, clue);
        //this.uploadImageToFirebase(imagePath, clue);
      }
    });

  }

  openImagePicker(clue){
    this.imagePicker.hasReadPermission()
    .then((result) => {
      if(result == false){
        // no callbacks required as this opens a popup which returns async
        this.imagePicker.requestReadPermission();
      }
      else if(result == true){
        this.imagePicker.getPictures({
          maximumImagesCount: 1
        }).then(
          (results) => {
            for (var i = 0; i < results.length; i++) {
              this.uploadImageToFirebase(results[i], clue);
            }
          }, (err) => console.log(err)
        );
      }
    }, (err) => {
      console.log(err);
    });
  }

  async uploadImageToFirebase(image, clue){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    const toast = await this.toastCtrl.create({
      message: 'Image was updated successfully',
      duration: 3000
    });
    this.presentLoading(loading);
    // let image_to_convert = 'http://localhost:8080/_file_' + image;
    let image_src = this.webview.convertFileSrc(image);
    let randomId = Math.random().toString(36).substr(2, 5);

    //uploads img to firebase storage
    this.firebaseService.uploadImage(image_src, randomId)
    .then(photoURL => {
      //this.image = photoURL;
      clue.firebaseImageURL = photoURL;
      this.firebaseService.updateEvent(this.item.id, this.item)
        .then(
          res => {
            loading.dismiss();
          },
          err => console.log(err)
        )
      toast.present();
    }, err =>{
      console.log(err);
      loading.dismiss();
    })
  }

  async presentLoading(loading) {
    return await loading.present();
  }

  logout(){
    this.authService.doLogout()
    .then(res => {
      this.router.navigate(["/login"]);
    }, err => {
      console.log(err);
    })
  }

}
