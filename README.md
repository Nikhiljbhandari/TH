## Build a Treasure Hunt App


### Set up
run `npm install` to install the project dependencies.
run `ionic serve` to run the project locally.

You will have to create your Firebase project and add the project configurations to the environment.ts file.

ionic plugin add cordova-plugin-camera --save
ionic plugin add cordova-plugin-file --save
ionic plugin add cordova-plugin-file-transfer --save
ionic cordova plugin --help
ionic cordova plugin add cordova-plugin-camera --save
ionic cordova plugin add cordova-plugin-file --save
ionic plugin add cordova-plugin-file-transfer --save
ionic cordova plugin add cordova-plugin-file-transfer --save
ionic plugin add cordova-plugin-filepath --save
ionic cordova plugin add cordova-plugin-filepath --save
ionic serve
y
npm i @ionic-native/camera@beta
npm i @ionic-native/file@beta
npm i @ionic-native/ionic-webview@beta
npm i @ionic-native/file-path@beta
ionic cordova plugin add cordova-plugin-camera
ionic cordova plugin add cordova-plugin-file
ionic cordova plugin add cordova-plugin-ionic-webview
ionic cordova plugin add cordova-sqlite-storage
ionic cordova plugin add cordova-plugin-filepath
ionic serve
y
ionic serve
y
ionic serve
y
npm install --save @ionic/storage
    IonicStorageModule.forRoot()
ionic serve
y
ionic serve
y
ionic serve
y
ionic cordova run android
y
ionic cordova run android
ionic cordova run android --verbose


ionic cordova plugin add @mauron85/cordova-plugin-background-geolocation
npm install @ionic-native/background-geolocation --save

ionic cordova build android --prod --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk my-alias
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk my-alias
C:\Users\nb\AppData\Local\Android\Sdk\build-tools\28.0.3\zipalign -v 4 app-release-unsigned.apk SnapHunt-Release.apk
cd platforms
cd android/app/build
cd outputs/release
cd outputs/apk/release
C:\Users\nb\AppData\Local\Android\Sdk\build-tools\28.0.3\zipalign -v 4 app-release-unsigned.apk SnapHunt-Release-2.0.0.apk
C:\Users\nb\AppData\Local\Android\Sdk\build-tools\28.0.3\apksigner verify SnapHunt-Release-2.0.0.apk



<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" />
    <uses-permission android:name="android.permission.AUTHENTICATE_ACCOUNTS" />
    <uses-permission android:name="android.permission.READ_SYNC_SETTINGS" />
    <uses-permission android:name="android.permission.WRITE_SYNC_SETTINGS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="com.google.android.gms.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_LOCATION_EXTRA_COMMANDS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.hardware.location" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-feature android:name="android.hardware.telephony" android:required="false" />
    
        <uses-permission android:name="android.permission.INTERNET" />
