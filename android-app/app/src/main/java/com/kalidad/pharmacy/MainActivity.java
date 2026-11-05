package com.kalidad.pharmacy;
import android.app.*;import android.os.*;import android.Manifest;import android.content.*;import android.content.pm.PackageManager;import android.net.Uri;import android.provider.Settings;import android.graphics.Color;import android.view.*;import android.webkit.*;import android.widget.Toast;import org.json.*;import java.io.*;import java.util.*;
public class MainActivity extends Activity {
 private WebView web;private static final String HOST="appassets.androidplatform.net";
 @Override public void onCreate(Bundle state){super.onCreate(state);getWindow().setStatusBarColor(Color.rgb(246,244,236));getWindow().setNavigationBarColor(Color.WHITE);
  web=new WebView(this);web.setBackgroundColor(Color.rgb(246,244,236));setContentView(web);
  web.setOnApplyWindowInsetsListener((v,insets)->{v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets.consumeSystemWindowInsets();});
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setJavaScriptCanOpenWindowsAutomatically(false);s.setSupportMultipleWindows(false);
  web.addJavascriptInterface(new Bridge(),"KalidadNative");web.setWebChromeClient(new WebChromeClient());
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){Uri u=r.getUrl();if(local(u))return false;if(r.isForMainFrame())open(u.toString());return true;}
   @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){Uri u=r.getUrl();if(!local(u))return blocked();try{String path=u.getPath().substring(1);if(path.isEmpty())path="index.html";if(path.contains("..")||path.contains("\\"))return blocked();String ext=path.substring(path.lastIndexOf('.')+1);String mime=switch(ext){case "html"->"text/html";case "css"->"text/css";case "js"->"text/javascript";case "json"->"application/json";case "webp"->"image/webp";case "png"->"image/png";default->"application/octet-stream";};return new WebResourceResponse(mime,"UTF-8",getAssets().open("www/"+path));}catch(Exception e){return blocked();}}
   @Override public void onPageFinished(WebView v,String url){if(getIntent().getBooleanExtra("reminders",false)&&local(Uri.parse(url))){getIntent().removeExtra("reminders");v.evaluateJavascript("openModal('reminders')",null);}}
   @Override public void onReceivedSslError(WebView v,android.webkit.SslErrorHandler h,android.net.http.SslError e){h.cancel();}
  });web.loadUrl("https://"+HOST+"/index.html");Reminders.channel(this);
 }
 static boolean local(Uri u){return "https".equals(u.getScheme())&&HOST.equals(u.getHost())&&(u.getPort()==-1||u.getPort()==443);}
 static WebResourceResponse blocked(){return new WebResourceResponse("text/plain","UTF-8",403,"Forbidden",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 void open(String url){runOnUiThread(()->{try{Uri u=Uri.parse(url);String scheme=u.getScheme();if("tel".equals(scheme)&&"+256759845260".equals(u.getSchemeSpecificPart())){startActivity(new Intent(Intent.ACTION_DIAL,u));return;}String host=u.getHost();if(!"https".equals(scheme)||host==null||!(host.equals("wa.me")||host.equals("kalidadpharmacy.com")||host.equals("www.google.com")||host.equals("maps.app.goo.gl")))return;startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(ActivityNotFoundException e){Toast.makeText(this,"No app is available to open this link.",Toast.LENGTH_LONG).show();}});}
 class Bridge {
  @JavascriptInterface public void openExternal(String url){if(url!=null&&url.length()<12000)open(url);}
  @JavascriptInterface public boolean notificationsEnabled(){if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return false;return ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).areNotificationsEnabled();}
  @JavascriptInterface public void enableNotifications(){runOnUiThread(()->{if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},42);else startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE,getPackageName()));});}
  @JavascriptInterface public String scheduleReminder(int id,String name,String time){try{if(id<=0||name==null||name.trim().isEmpty()||name.length()>60||time==null||!time.matches("([01][0-9]|2[0-3]):[0-5][0-9]"))throw new IllegalArgumentException();Reminders.save(MainActivity.this,id,name.trim(),time);return "{\"ok\":true}";}catch(Exception e){return "{\"ok\":false,\"error\":\"Unable to schedule reminder. Check its label and time.\"}";}}
  @JavascriptInterface public void cancelReminder(int id){Reminders.cancel(MainActivity.this,id);}
  @JavascriptInterface public void clearReminders(){Reminders.clear(MainActivity.this);}
 }
 @Override public void onBackPressed(){web.evaluateJavascript("window.kalidadBack ? window.kalidadBack() : false",result->{if(!"true".equals(result))super.onBackPressed();});}
 @Override protected void onResume(){super.onResume();if(web!=null)web.evaluateJavascript("window.dispatchEvent(new Event('focus'))",null);}
 @Override protected void onDestroy(){web.removeJavascriptInterface("KalidadNative");web.destroy();super.onDestroy();}
}
