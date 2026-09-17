package com.athkar.alyawm;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;

public class MainActivity extends Activity {
  private AssetServer server;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    getWindow().setStatusBarColor(Color.parseColor("#FAF6ED"));

    server = new AssetServer(getAssets());
    server.startAndWait();

    WebView web = new WebView(this);
    web.setBackgroundColor(Color.parseColor("#FAF6ED"));
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setGeolocationEnabled(true);
    s.setLoadWithOverviewMode(true);
    s.setUseWideViewPort(true);
    s.setSupportZoom(false);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setCacheMode(WebSettings.LOAD_DEFAULT);
    web.setWebViewClient(new WebViewClient());
    web.setWebChromeClient(
        new WebChromeClient() {
          @Override
          public void onGeolocationPermissionsShowPrompt(
              String origin, GeolocationPermissions.Callback callback) {
            callback.invoke(origin, true, false);
          }
        });
    web.loadUrl("http://127.0.0.1:18765/");
    setContentView(web);
  }

  @Override
  protected void onDestroy() {
    if (server != null) server.stopServer();
    super.onDestroy();
  }
}
