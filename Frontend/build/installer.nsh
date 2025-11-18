; build/installer.nsh - Custom NSIS installer script
!include "nsExec.nsh"
!macro customInstall
  ; Set registry view for 64-bit
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
  
  ; Add registry entries
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayIcon" "$INSTDIR\resources\app.asar\assets\icon.ico"
  
  ; Initialize database if MySQL is installed. Do not block installer on failure.
  ; Approach:
  ; 1) Try to locate `mysql` via `where mysql` (preferred) — more flexible than hard-coded path.
  ; 2) If found, copy SQL file and execute a small batch that runs the import. Execution is attempted
  ;    but any failure is non-blocking; outcome and presence flags are written to the registry under
  ;    HKCU\Software\${APP_ID} so the app or support tools can inspect later.
  ClearErrors
  nsExec::ExecToStack 'where mysql'
  Pop $0 ; exit code
  Pop $1 ; path(s) or message
  StrCmp $0 0 mysql_found no_mysql

  mysql_found:
    ; Normalize first found path (split lines if any)
    StrCpy $mysqlPath "$1"
    ; Copy SQL script to installation directory if it exists
    SetOutPath "$INSTDIR\resources"
    ClearErrors
    File /nonfatal "${BUILD_RESOURCES_DIR}\init_db.sql"
    IfErrors +3
      ; Create temp batch file to run import silently and log output
      FileOpen $9 "$TEMP\init_db.bat" w
      FileWrite $9 '@echo off$\r$\n'
      FileWrite $9 'echo Initializing Cortez database...$\r$\n'
      FileWrite $9 '"$mysqlPath" -u root -proot < "$INSTDIR\resources\init_db.sql" 1>"%TEMP%\\cortez_db_init_out.log" 2>"%TEMP%\\cortez_db_init_err.log"$\r$\n'
      FileWrite $9 'if %ERRORLEVEL% EQU 0 ($\r$\n'
      FileWrite $9 '  echo Database initialization successful$\r$\n'
      FileWrite $9 ') else ($\r$\n'
      FileWrite $9 '  echo Error initializing database (continuing installer)$\r$\n'
      FileWrite $9 ')$\r$\n'
      FileClose $9
      ; Run batch but do not block installer on failure; still wait the command to capture immediate exit
      ExecWait '"$TEMP\init_db.bat"'
      ; Clean up batch file (logs preserved)
      Delete "$TEMP\init_db.bat"
      ; Record registry flags for presence and init attempt
      WriteRegStr HKCU "Software\${APP_ID}" "MySQLDetected" "1"
      WriteRegStr HKCU "Software\${APP_ID}" "MySQLInitAttempted" "1"
    Goto done_mysql

  no_mysql:
    ; mysql not found — write registry flag and proceed silently
    WriteRegStr HKCU "Software\${APP_ID}" "MySQLDetected" "0"

  done_mysql:
  ${If} ${RunningX64}
    SetRegView 32
  ${EndIf}
  
  ; Detect Node.js in PATH and surface version non-blocking (uses nsExec)
  ; If nsExec is not available, this will silently fail.
  ClearErrors
  nsExec::ExecToStack 'where node'
  Pop $0
  Pop $1
  StrCmp $0 0 node_found node_not_found

  node_found:
    ; get version string
    nsExec::ExecToStack 'node -v'
    Pop $0
    Pop $1
    ; write detection and version to registry for support tools
    WriteRegStr HKCU "Software\${APP_ID}" "NodeDetected" "1"
    StrCpy $nodeVersion "$1"
    WriteRegStr HKCU "Software\${APP_ID}" "NodeVersion" "$nodeVersion"
    Goto node_done

  node_not_found:
    WriteRegStr HKCU "Software\${APP_ID}" "NodeDetected" "0"

  node_done:
!macroend

!macro customUnInstall
  ; Add custom uninstall logic here if needed
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"
!macroend