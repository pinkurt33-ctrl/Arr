# Web Animator

Har website pe: **DECODING** loader (sound ke saath) -> page ek-ek karke fade-in (words line by line) -> screen pe udti chidiyaan. Black theme.

## Android APK (GitHub Actions)
1. Is repo me code push karo (`.github` folder zaroor jaye).
2. **Actions** tab -> "Build APK" chalega (3-5 min). Manual: Actions -> Build APK -> Run workflow.
3. Run kholo -> neeche **Artifacts -> WebAnimator-APK** download karo -> `app-debug.apk` install karo.

App ek apna browser hai: upar address bar, **Settings** me loader / sound / birds ON-OFF.

## Chrome / Edge extension (laptop)
1. `chrome://extensions` -> **Developer mode** ON
2. **Load unpacked** -> `chrome-extension` folder chuno
3. Toolbar ke icon se loader / sound / birds control.

## Demo
`demo/index.html` browser me kholo (ya GitHub Pages ON karo: Settings -> Pages -> Deploy from branch -> `/demo`).

## Files
- `app/src/main/assets/animator.js` aur `chrome-extension/animator.js`: ek hi core script (dono jagah same rakho).
- Sound: browser pehle touch ke baad hi awaaz chalne deta hai (loader me "TAP FOR SOUND" aata hai).
