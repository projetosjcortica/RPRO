; build/installer.nsh - Custom NSIS installer script

!macro customInstall
  ; Set registry view for 64-bit
  SetRegView 64
  
  ; Add registry entries
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayIcon" "$INSTDIR\resources\app.asar\assets\icon.ico"
  
  ; Adicionar ao startup do Windows (iniciar minimizado)
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Cortez" '"$INSTDIR\Cortez.exe" --minimized'
  DetailPrint "Cortez será iniciado automaticamente com o Windows"
  
  ; Initialize database if MySQL is installed
  StrCpy $0 "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
  IfFileExists $0 mysql_exists no_mysql
  
  mysql_exists:
    ; Create temporary batch file to execute SQL script
    FileOpen $9 "$TEMP\init_db.bat" w
    FileWrite $9 '@echo off$\r$\n'
    FileWrite $9 'echo Initializing Cortez database...$\r$\n'
    FileWrite $9 '"$0" -u root -proot < "$INSTDIR\resources\init_db.sql"$\r$\n'
    FileWrite $9 'if %ERRORLEVEL% EQU 0 ($\r$\n'
    FileWrite $9 '  echo Database initialization successful$\r$\n'
    FileWrite $9 ') else ($\r$\n'
    FileWrite $9 '  echo Error initializing database$\r$\n'
    FileWrite $9 '  pause$\r$\n'
    FileWrite $9 ')$\r$\n'
    FileClose $9
    
    ; Copy SQL script to installation directory if it exists
    SetOutPath "$INSTDIR\resources"
    ClearErrors
    File /nonfatal "${BUILD_RESOURCES_DIR}\init_db.sql"
    
    ; Execute batch file only if SQL file exists and was copied successfully
    IfErrors +3
    ExecWait '"$TEMP\init_db.bat"'
    Delete "$TEMP\init_db.bat"
    Goto done_mysql
    
  no_mysql:
    MessageBox MB_OK|MB_ICONINFORMATION "MySQL não encontrado. O banco de dados será inicializado automaticamente na primeira execução do programa."
    
  done_mysql:
  SetRegView 32
!macroend

!macro customUnInstall
  ; Remover do startup do Windows
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Cortez"
  ; Remove uninstall key
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"
!macroend