import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
//import { TNCModalPage } from '../tnc/tnc-modal.page';
import { ExampleModalPage } from '../example-modal/example-modal.page'

import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  items: Array<any>;
  peopleEvent : Array<any>;
  errorMessage: string = '';

  constructor(
    public loadingCtrl: LoadingController,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
        public modalController: ModalController


  ) { }

  ngOnInit() {
    if (this.route && this.route.data) {
      this.getData();
    }
  }

  async getData(){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);

    this.route.data.subscribe(routeData => {
      let themeId = routeData['data'].themeId;
      routeData['data'].subscribe(data => {
        this.items = data;
        this.firebaseService.getPeopleEvent()
          .then(data => {
          data.subscribe( data1 =>{
            this.peopleEvent = data1;
              if (this.peopleEvent) {
                this.items.forEach(item => {
                  item.themeId = themeId;
                  this.peopleEvent.forEach ( event => {
                    if (event && event.payload.doc.data().eventId === item.payload.doc.id) {
                      item.eventActivated = true;
                      item.startedAt = event.payload.doc.data().startedAt;
                      item.maxSpeed = event.payload.doc.data().maxSpeed;
                      contactDetails: item.payload.doc.data().contactDetails
                    }
                  })
                })
              }
          });
          //this.peopleEvent = data;

        }, err => {

        })

        loading.dismiss();
      })
    })
  }

  async presentLoading(loading) {
    return await loading.present();
  }

  startOrContinue(item) {

    let data = {
          eventName: item.payload.doc.data().name,
          eventId: item.payload.doc.id,
          startedAt: item.startedAt,
          image: item.payload.doc.data().image,
          eventStartTime: item.payload.doc.data().startTime,
          eventEndTime: item.payload.doc.data().endTime,
          themeId: item.themeId,
          clues: item.clues,
          maxSpeed: item.payload.doc.data().maxSpeed,
          contactDetails: item.payload.doc.data().contactDetails,
          sendSMS: item.payload.doc.data().sendSMS
        }
    //const loading = await this.loadingCtrl.create({
      //  message: 'Please wait...'
      //});
    //this.presentLoading(loading);
    if (!item.eventActivated) {
        this.firebaseService.getEventFromEvents(data.eventId, data.themeId)
          .then(res => {
          res.subscribe(response => {
          data.clues = response;
          data.startedAt = Date.now();

          this.firebaseService.addPeopleEvent(data)
            .then(
              res => {
              this.openModal();
               // this.router.navigate(['/details']);
              },err => {
                this.errorMessage = err.message;
                console.log(err)
            })
        })
      })
    } else {
      this.openModal();
      //this.router.navigate(['/details']);
    }
   // loading.dismiss();
  }

  async openModal() {
      const modal = await this.modalController.create({
        component: ExampleModalPage,
        componentProps: {
          "paramID": 123,
          "paramTitle": "Test Title"
        }
      });

      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned !== null) {
          //this.dataReturned = dataReturned.data;
          //alert('Modal Sent Data :'+ dataReturned);
          this.router.navigate(['/details']);
        }
      });

      return await modal.present();
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
