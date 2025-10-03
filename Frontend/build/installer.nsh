; build/installer.nsh - Custom NSIS installer script
!macro customInstall
  ; Add custom installation logic here if needed
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
  
  ; Example: Add registry entries or custom actions
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayIcon" "$INSTDIR\resources\app.asar\assets\icon.ico"
  
  ${If} ${RunningX64}
    SetRegView 32
  ${EndIf}
!macroend

!macro customUnInstall
  ; Add custom uninstall logic here if needed
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"
!macroend