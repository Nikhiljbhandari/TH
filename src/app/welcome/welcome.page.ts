import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  items: Array<any>;
  peopleEvent : Array<any>;
  errorMessage: string = '';
  sponserImageURL: string = './assets/imgs/sponsorimage.jpg';

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
      routeData['data'].subscribe(data => {
        this.items = data;
        loading.dismiss();
      })
    })
  }

  async presentLoading(loading) {
    return await loading.present();
  }

  gotoHome(item) {
    this.router.navigate(['/home', {themeId: item.payload.doc.data().theme}]);
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
