package com.pinku.webanimator;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;

import java.io.InputStream;

public class MainActivity extends Activity {
    private WebView web;
    private EditText urlBox;
    private ProgressBar bar;
    private SharedPreferences sp;
    private String animJs = "";

    private final String[] optNames = {"DECODING loader", "Sound", "Birds"};
    private final String[] optKeys = {"loader", "sound", "birds"};

    private int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density);
    }

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        sp = getSharedPreferences("pa", 0);
        try {
            InputStream is = getAssets().open("animator.js");
            byte[] buf = new byte[is.available()];
            is.read(buf);
            is.close();
            animJs = new String(buf, "UTF-8");
        } catch (Exception e) { e.printStackTrace(); }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xFF000000);
        root.setFitsSystemWindows(true);

        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(8), dp(6), dp(8), dp(6));

        urlBox = new EditText(this);
        urlBox.setSingleLine(true);
        urlBox.setHint("Website ya search likho");
        urlBox.setHintTextColor(0xFF777777);
        urlBox.setTextColor(Color.WHITE);
        urlBox.setTextSize(14);
        urlBox.setImeOptions(EditorInfo.IME_ACTION_GO);
        urlBox.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI);
        urlBox.setOnEditorActionListener((v, id, ev) -> {
            if (id == EditorInfo.IME_ACTION_GO || (ev != null && ev.getKeyCode() == KeyEvent.KEYCODE_ENTER)) {
                go(urlBox.getText().toString());
                return true;
            }
            return false;
        });
        top.addView(urlBox, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));

        Button goBtn = new Button(this);
        goBtn.setText("Go");
        goBtn.setOnClickListener(v -> go(urlBox.getText().toString()));
        top.addView(goBtn);

        Button setBtn = new Button(this);
        setBtn.setText("Settings");
        setBtn.setOnClickListener(v -> openSettings());
        top.addView(setBtn);

        root.addView(top);

        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        root.addView(bar, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(3)));

        web = new WebView(this);
        web.setBackgroundColor(0xFF000000);
        WebSettings ws = web.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setLoadWithOverviewMode(true);
        ws.setUseWideViewPort(true);
        ws.setBuiltInZoomControls(true);
        ws.setDisplayZoomControls(false);
        ws.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageStarted(WebView v, String u, android.graphics.Bitmap f) {
                urlBox.setText(u);
                bar.setVisibility(android.view.View.VISIBLE);
            }
            @Override public void onPageCommitVisible(WebView v, String u) { inject(); }
            @Override public void onPageFinished(WebView v, String u) {
                inject();
                bar.setVisibility(android.view.View.GONE);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView v, int p) { bar.setProgress(p); }
        });
        root.addView(web, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        setContentView(root);
        web.loadUrl("https://www.google.com");
    }

    private void inject() {
        String cfg = "{loader:" + sp.getBoolean("loader", true)
                + ",sound:" + sp.getBoolean("sound", true)
                + ",birds:" + sp.getBoolean("birds", true) + "}";
        web.evaluateJavascript(animJs + ";window.__paStart(" + cfg + ");", null);
    }

    private void go(String s) {
        s = s.trim();
        if (s.isEmpty()) return;
        String u;
        if (s.startsWith("http://") || s.startsWith("https://")) u = s;
        else if (s.contains(".") && !s.contains(" ")) u = "https://" + s;
        else u = "https://www.google.com/search?q=" + Uri.encode(s);
        web.loadUrl(u);
        InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(urlBox.getWindowToken(), 0);
    }

    private void openSettings() {
        final boolean[] checked = new boolean[optKeys.length];
        for (int i = 0; i < optKeys.length; i++) checked[i] = sp.getBoolean(optKeys[i], true);
        new AlertDialog.Builder(this)
            .setTitle("Settings")
            .setMultiChoiceItems(optNames, checked, (d, which, isOn) -> checked[which] = isOn)
            .setPositiveButton("OK", (d, w) -> {
                SharedPreferences.Editor e = sp.edit();
                for (int i = 0; i < optKeys.length; i++) e.putBoolean(optKeys[i], checked[i]);
                e.apply();
                web.reload();
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
    }
