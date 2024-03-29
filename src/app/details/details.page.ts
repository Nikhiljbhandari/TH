import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';

import { FirebaseService } from '../services/firebase.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { LoadingController, ToastController, AlertController, ActionSheetController, Platform } from '@ionic/angular';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import * as jsPDF from 'jspdf';
import { File, IWriteOptions, FileEntry } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BackgroundGeolocation,
                                 BackgroundGeolocationConfig,
                                 BackgroundGeolocationResponse,
                                 BackgroundGeolocationEvents } from "@ionic-native/background-geolocation/ngx";
import { NgZone } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

const STORAGE_KEY = 'my_images';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  providers: [DatePipe]
})
export class DetailsPage implements OnInit, OnDestroy {

  image: any;
  item: any;
  load: boolean = false;
  loading: any;
  peopleDetails: any;
  images = [];
  sliderConfig = {
    slidesPerView: 1.2,
    spaceBetween: 2,
    centeredSlides: true
  };
   lat : any;
   lng : any;
   speed: any;
   watch: any;
    x:any;
   speedFromGeoLocation : any;
   updateTS : any;
   startSms: any;
   finishSms: any;
   disqualifiedSms: any;

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
    private ref: ChangeDetectorRef,
    private filePath: FilePath,
    private datePipe: DatePipe,
    public geolocation: Geolocation,
    public zone: NgZone,
    public backgroundGeolocation: BackgroundGeolocation,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private sms: SMS,
    private nativeAudio: nativeAudio
  ) { }

  ngOnInit() {
    this.plt.ready().then(() => {
          //this.loadStoredImages();
      this.checkGPSPermission();

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(
        result => {
          if (!result.hasPermission) {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS );
          }
        },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS )
        );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(
        result => {
          if (!result.hasPermission) {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE );
          }
        },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE )
        );
    });

    if (this.route && this.route.data) {
      this.getData();
    }
  }

  ngOnDestroy() {
    console.log('ngOndestroy called');
this.nativeAudio.unload('uniqueId1').then(() => console.log('uniqueId1 is unoaded'));
    this.stopTracking();
  }

  checkGPSPermission() {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        result => {
          if (result.hasPermission) {

            //If having permission show 'Turn On GPS' dialogue
            this.askToTurnOnGPS();
          } else {

            //If not having permission ask for permission
            this.requestGPSPermission();
          }
        },
        err => {
          alert(err);
        }
      );
    }

    requestGPSPermission() {
      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if (canRequest) {
          console.log("4");
        } else {
          //Show 'GPS Permission Request' dialogue
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
            .then(
              () => {
                // call method to turn on GPS
                this.askToTurnOnGPS();
              },
              error => {
                //Show alert if user click on 'No Thanks'
                alert('requestPermission Error requesting location permissions ' + error);
                this.router.navigate(["/home"]);

              }
            );
        }
      });
    }

    askToTurnOnGPS() {
      this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
        () => {
          this.startTracking();
          // When GPS Turned ON call method to get Accurate location coordinates
        },
        error => {
            alert('Error requesting location permissions ' + JSON.stringify(error));
          this.router.navigate(["/home"]);
        }
      );
    }


  startTracking() {

    /*let config:BackgroundGeolocationConfig  = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 1000,
      stopOnTerminate: false
    };

    this.backgroundGeolocation.configure(config).then((location:BackgroundGeolocationResponse) => {

      //console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
//      console.log(this.lat ,      this.lng,      this.speed);

      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
        this.speed = location.speed ? ((location.speed * 3600)/1000) : 0 ; // can be speed * 3.6 and should be round for 2 decimal

      });
      this.backgroundGeolocation
              .on(BackgroundGeolocationEvents.location)
              .subscribe((location: BackgroundGeolocationResponse) => {
                console.log(location);
                this.speedFromGeoLocation = location.speed;

                // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
                // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
              });

    }, (err) => {
      console.log(err);

    });

    this.backgroundGeolocation.start();*/

    let options = {
      frequency: 1000,
      enableHighAccuracy: true,
      timeout:3000,
      maximumAge: 3000
    };

    this.watch = this.geolocation.watchPosition(options)
    //.filter((p) => p.coords !== undefined)
    .subscribe((position) => {

      console.log(position);

      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.speed = position.coords.speed ? ((position.coords.speed * 3600)/1000) : 0 ;
        this.updateTS = position.timestamp;
        if (this.speed && this.item) {
          if (!this.item.endAt && this.speed > this.item.maxSpeed) {
            this.item.endAt = Date.now();
            this.firebaseService.updateEvent(this.item.id, this.item)
              .then(
                res => {
                  this.sendSMS(true);
                  //this.presentToast("You have been disqualified since you crossed the speed limit of "+this.item.maxSpeed+ " . Please contact organizing Team");
                  this.speedFinish();

                },
                err => console.log(err)
              )
          }
        }
      });

    });
  }

  sendSMS(disqualified) {

    if (this.item.sendSMS) {

      var options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          //intent: 'INTENT' // send SMS with the native android SMS messaging
          intent: '' // send SMS without opening any other app
        }
      };
      let msg = this.disqualifiedSms;
      if (!disqualified)  {
        msg = this.finishSms;
      }
      this.sms.hasPermission().then( result => {
        this.item.contactDetails.forEach( contact => {
            this.sms.send(contact, msg, options)
              .then(()=>{
                console.log('SMS sent to ' + contact);
              },()=>{
                console.log('unable to send SMS ');
              });
        });
      }, err => console.log(err));

    }

  }

  stopTracking() {
    console.log('stopTracking');
    //this.backgroundGeolocation.finish();
    this.watch.unsubscribe();

  }

  async speedFinish() {
  this.nativeAudio.loop('uniqueId1', () => console.log('uniqueId1 is started playing'));

      const alert = await this.alertCtrl.create({
        header: 'Disqualified !!!!! ',
        message: 'Since You elapsed the max speed of '+this.item.maxSpeed +'. Please contact Organizing Team ',
        buttons: [
          {
            text: 'Ok',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {this.nativeAudio.stop('uniqueId1', () => console.log('uniqueId1 is done playing'));
}
          }
        ]
      });
      await alert.present();
    }


  async getData(){
    this.route.data.subscribe(routeData => {
      routeData['data'].subscribe(data => {
        this.item = data[0].payload.doc.data();
        this.nativeAudio.preloadSimple('uniqueId1','assets/audio/Warning.mp3');
        this.item.id = data[0].payload.doc.id;
        this.firebaseService.getPeopleDetails()
          .then(data1 => {
            data1.subscribe(data2 => {
              this.peopleDetails = data2;
              this.disqualifiedSms = this.peopleDetails[0].payload.doc.data().name + ' have elapsed max speed limit of '+ this.item.maxSpeed +' and hence are disqualified';
              this.finishSms = this.peopleDetails[0].payload.doc.data().name + ' have completed the event '+this.item.eventName;
          })
            },
           err => {

        })
      })
    })
  }

  getBase64Image(img) {
    var canvas = document.createElement("canvas");
    console.log("image");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/jpeg");
    return dataURL;
  }

  exportPdf() {
    var doc =  new jsPDF("p","mm","a4");
    var i=0;
    var width = doc.internal.pageSize.width;
    var height = doc.internal.pageSize.height;
    doc.setTextColor(255, 0, 0);
    doc.setFontType('bolditalic');
    doc.setFontSize(24);
    doc.text(20, 20, 'Congratulations '+this.peopleDetails[0].payload.doc.data().name+' On Completing Event')
    doc.text(70, 30, this.item.eventName);
    doc.setFontType('normal');
    doc.setTextColor(0, 0, 255);
    doc.setFontSize(16);
    doc.text(20, 40, 'Event Started at '+ this.datePipe.transform(this.item.startedAt,'EEEE, MMMM d, y HH:mm:ss.SSS'));
    doc.text(20, 50, 'Event Ended at '+ this.datePipe.transform(this.item.endAt,'EEEE, MMMM d, y HH:mm:ss.SSS'));
    doc.text(20, 60, 'Total Time taken to complete this event ' + (this.item.endAt-this.item.startedAt)/1000 + ' seconds');

    doc.text(20, 70, 'MPF PUNE SOUTH THANKS');
    this.peopleDetails[0].payload.doc.data().teamMembers.forEach( people => {
      doc.text(50, i+80, people);
      i=i+10;
    });
    //doc.text(20, i, 'Please Send this file ');
    i=0;
    this.item.clues.forEach( clue => {
      var y = 20;
      doc.addPage();
      y=y+10;
      doc.text(20,y, clue.name);
      y=y+10;
      var lines = doc.splitTextToSize(clue.description, width-20);
      doc.text(20,y, lines);
      y=y+(10*lines.length);

      var img = document.getElementById('img'+i);
      if (img) {
        let imageData= this.getBase64Image(img);
        doc.addImage(imageData, "jpg", 20, y, width-30, height-(y+10));
      }
      i++;
    });

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
                this.sendSMS(false);
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
      //this.uploadImageToFirebase(imagePath, clue);
      this.firebaseService.updateEvent(this.item.id, this.item)
              .then(
                res => {
                  //loading.dismiss();
                  this.ref.detectChanges();
                },
                err => console.log(err)
              )
      //this.ref.detectChanges(); // trigger change detection cycle
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

  /*openImagePicker(clue){
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
  }*/

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
    let randomId = this.createFileName(clue.name);//Math.random().toString(36).substr(2, 5);

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
