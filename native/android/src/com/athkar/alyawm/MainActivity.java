package com.athkar.alyawm;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;

public class MainActivity extends Activity {
  private static final int GEO_REQUEST = 41;
  private AssetServer server;
  private GeolocationPermissions.Callback geoCb;
  private String geoOrigin;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    requestWindowFeature(Window.FEATURE_NO_TITLE);
    getWindow().setStatusBarColor(Color.parseColor("#F5F7FB"));

    server = new AssetServer(getAssets());
    server.startAndWait();

    WebView web = new WebView(this);
    web.setBackgroundColor(Color.parseColor("#F5F7FB"));
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setGeolocationEnabled(true);
    s.setLoadWithOverviewMode(true);
    s.setUseWideViewPort(true);
    s.setSupportZoom(false);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setCacheMode(WebSettings.LOAD_NO_CACHE);
    web.setWebViewClient(new WebViewClient());
    web.setWebChromeClient(
        new WebChromeClient() {
          @Override
          public void onGeolocationPermissionsShowPrompt(
              String origin, GeolocationPermissions.Callback callback) {
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
              callback.invoke(origin, true, false);
              return;
            }
            geoCb = callback;
            geoOrigin = origin;
            requestPermissions(
                new String[] {
                  Manifest.permission.ACCESS_FINE_LOCATION,
                  Manifest.permission.ACCESS_COARSE_LOCATION
                },
                GEO_REQUEST);
          }
        });
    web.loadUrl("http://127.0.0.1:18765/");
    setContentView(web);
  }

  @Override
  public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
    super.onRequestPermissionsResult(code, perms, results);
    if (code != GEO_REQUEST || geoCb == null) return;
    boolean ok = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
    geoCb.invoke(geoOrigin, ok, false);
    geoCb = null;
  }

  @Override
  protected void onDestroy() {
    if (server != null) server.stopServer();
    super.onDestroy();
  }
}