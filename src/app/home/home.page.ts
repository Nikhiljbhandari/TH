import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

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
    private firebaseService: FirebaseService

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
          this.peopleEvent = data;
          if (this.peopleEvent) {
            this.items.forEach(item => {
              item.themeId = themeId;
              this.peopleEvent.forEach ( event => {
                if (event[0] && event[0].eventId === item.payload.doc.id) {
                  item.eventActivated = true;
                  item.startedAt = event[0].startedAt;
                }
              })
            })
          }
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
          clues: item.clues
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
                this.router.navigate(['/details']);
              },err => {
                this.errorMessage = err.message;
                console.log(err)
            })
        })
      })
    } else {
      this.router.navigate(['/details']);
    }
   // loading.dismiss();
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