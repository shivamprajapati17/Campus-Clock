package com.campusclock.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * Campus Clock – Android shell.
 *
 * The web app is the product, so the app hosts it in a hardened WebView with
 * native download support (the export buttons generate blobs in JavaScript),
 * an offline retry screen, and system back navigation.
 */
public class MainActivity extends Activity {

    private static final String HOME_URL = "https://campusclock.vercel.app";
    private static final String HOME_HOST = "campusclock.vercel.app";

    private WebView webView;
    private ProgressBar progress;
    private LinearLayout errorPanel;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getWindow().setStatusBarColor(Color.parseColor("#171717"));
        getWindow().setNavigationBarColor(Color.parseColor("#FFF5EB"));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#FFF5EB"));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#FFF5EB"));
        webView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " CampusClockApp/1.0");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.addJavascriptInterface(new NativeBridge(), "CampusClockNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                if (host != null && (host.equals(HOME_HOST) || host.endsWith(".vercel.app"))) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                    // No browser installed — keep the user inside the app.
                    return false;
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progress.setVisibility(View.GONE);
                hideError();
                view.evaluateJavascript(DOWNLOAD_BRIDGE_JS, null);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    progress.setVisibility(View.GONE);
                    showError();
                }
            }
        });

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition,
                                        String mimeType, long contentLength) {
                if (url.startsWith("blob:")) {
                    // Blob downloads are routed through the JavaScript bridge.
                    return;
                }
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                    request.setNotificationVisibility(
                            DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(
                            Environment.DIRECTORY_DOWNLOADS,
                            URLUtil.guessFileName(url, contentDisposition, mimeType));
                    String cookie = CookieManager.getInstance().getCookie(url);
                    if (cookie != null) {
                        request.addRequestHeader("Cookie", cookie);
                    }
                    DownloadManager manager =
                            (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    manager.enqueue(request);
                    Toast.makeText(MainActivity.this,
                            "Downloading to Downloads…", Toast.LENGTH_SHORT).show();
                } catch (Exception err) {
                    Toast.makeText(MainActivity.this,
                            "Could not start the download.", Toast.LENGTH_SHORT).show();
                }
            }
        });

        root.addView(webView);
        root.addView(buildProgress());
        root.addView(buildErrorPanel());

        setContentView(root);
        webView.loadUrl(HOME_URL);
    }

    private ProgressBar buildProgress() {
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setIndeterminate(true);
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(4));
        params.gravity = Gravity.TOP;
        progress.setLayoutParams(params);
        return progress;
    }

    private LinearLayout buildErrorPanel() {
        errorPanel = new LinearLayout(this);
        errorPanel.setOrientation(LinearLayout.VERTICAL);
        errorPanel.setGravity(Gravity.CENTER);
        errorPanel.setPadding(dp(32), dp(32), dp(32), dp(32));
        errorPanel.setBackgroundColor(Color.parseColor("#FFF5EB"));
        errorPanel.setVisibility(View.GONE);

        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT);
        errorPanel.setLayoutParams(params);

        TextView title = new TextView(this);
        title.setText("Can't reach Campus Clock");
        title.setTextColor(Color.parseColor("#171717"));
        title.setTextSize(20);
        title.setGravity(Gravity.CENTER);

        TextView hint = new TextView(this);
        hint.setText("Check your internet connection, then try again.");
        hint.setTextColor(Color.parseColor("#666666"));
        hint.setTextSize(13);
        hint.setGravity(Gravity.CENTER);
        hint.setPadding(0, dp(8), 0, dp(20));

        Button retry = new Button(this);
        retry.setText("Try again");
        retry.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                hideError();
                progress.setVisibility(View.VISIBLE);
                webView.reload();
            }
        });

        errorPanel.addView(title);
        errorPanel.addView(hint);
        errorPanel.addView(retry);
        return errorPanel;
    }

    private void showError() {
        errorPanel.setVisibility(View.VISIBLE);
        errorPanel.bringToFront();
    }

    private void hideError() {
        errorPanel.setVisibility(View.GONE);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onBackPressed() {
        if (errorPanel.getVisibility() == View.VISIBLE) {
            hideError();
            webView.reload();
            return;
        }
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }

    /** Saves a base64 payload from the web app into the device Downloads folder. */
    private class NativeBridge {
        @JavascriptInterface
        public void saveFile(String name, String mimeType, String base64Data) {
            String fileName = sanitize(name);
            String mime = (mimeType == null || mimeType.isEmpty())
                    ? "application/octet-stream" : mimeType;

            try {
                byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, mime);
                    values.put(MediaStore.Downloads.IS_PENDING, 1);

                    Uri uri = getContentResolver()
                            .insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri == null) throw new IllegalStateException("No download target");

                    try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                        if (out == null) throw new IllegalStateException("No output stream");
                        out.write(bytes);
                    }

                    values.clear();
                    values.put(MediaStore.Downloads.IS_PENDING, 0);
                    getContentResolver().update(uri, values, null, null);
                } else {
                    File dir = new File(getExternalFilesDir(null), "Downloads");
                    if (!dir.exists() && !dir.mkdirs()) {
                        throw new IllegalStateException("Could not create download folder");
                    }
                    try (FileOutputStream out = new FileOutputStream(new File(dir, fileName))) {
                        out.write(bytes);
                    }
                }

                final String message = "Saved to Downloads: " + fileName;
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
                    }
                });
            } catch (Exception err) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this,
                                "Could not save the file.", Toast.LENGTH_LONG).show();
                    }
                });
            }
        }
    }

    private static String sanitize(String name) {
        if (name == null || name.trim().isEmpty()) return "campus-clock-file";
        return name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
    }

    /**
     * The export buttons create a Blob and click a temporary anchor, which a
     * WebView cannot download natively. This bridge remembers the blob for its
     * object URL and hands the bytes to {@link NativeBridge#saveFile}.
     */
    private static final String DOWNLOAD_BRIDGE_JS =
            "(function(){"
            + "if(window.__ccDownloadHooked){return;}window.__ccDownloadHooked=true;"
            + "var blobs={};var create=URL.createObjectURL.bind(URL);"
            + "URL.createObjectURL=function(b){var u=create(b);blobs[u]=b;return u;};"
            + "document.addEventListener('click',function(e){"
            + "var t=e.target;var a=t&&t.closest?t.closest('a[download]'):null;"
            + "if(!a){return;}var href=a.getAttribute('href')||'';"
            + "var blob=blobs[href];if(!blob){return;}"
            + "var name=a.getAttribute('download')||'campus-clock-file';"
            + "e.preventDefault();e.stopPropagation();"
            + "var reader=new FileReader();"
            + "reader.onloadend=function(){"
            + "var data=String(reader.result||'');var comma=data.indexOf(',');"
            + "CampusClockNative.saveFile(name,blob.type||'application/octet-stream',"
            + "data.substring(comma+1));};"
            + "reader.readAsDataURL(blob);"
            + "},true);"
            + "})();";
}
