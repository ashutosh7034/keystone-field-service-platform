@REM ----------------------------------------------------------------------------
@REM Maven Wrapper for Windows (CMD / PowerShell)
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL EnableExtensions EnableDelayedExpansion

SET "DIR=%~dp0"
SET "WRAPPER_DIR=%DIR%.mvn\wrapper"
SET "WRAPPER_PROPS=%WRAPPER_DIR%\maven-wrapper.properties"

@REM Auto-detect local JDK 21 if JAVA_HOME is not set
IF "%JAVA_HOME%" == "" (
    IF EXIST "%DIR%..\.tools\jdk21\bin\java.exe" (
        SET "JAVA_HOME=%DIR%..\.tools\jdk21"
        SET "PATH=!JAVA_HOME!\bin;!PATH!"
    )
)

@REM Check if local portable maven exists
IF EXIST "%DIR%..\.tools\maven\bin\mvn.cmd" (
    SET "MVN_CMD=%DIR%..\.tools\maven\bin\mvn.cmd"
    GOTO RUN_MAVEN
)

SET "MAVEN_VERSION=3.9.9"
SET "MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
SET "MAVEN_ZIP=%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%-bin.zip"
SET "MAVEN_HOME=%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%"
SET "MVN_CMD=%MAVEN_HOME%\bin\mvn.cmd"

IF EXIST "%MVN_CMD%" (
    GOTO RUN_MAVEN
)

IF NOT EXIST "%MAVEN_DIR%" (
    MKDIR "%MAVEN_DIR%" 2>NUL
)

IF NOT EXIST "%MAVEN_ZIP%" (
    ECHO Downloading Apache Maven %MAVEN_VERSION%...
    powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip', '%MAVEN_ZIP%')"
    IF ERRORLEVEL 1 (
        ECHO [ERROR] Failed to download Apache Maven. Check your internet connection.
        EXIT /B 1
    )
)

IF NOT EXIST "%MVN_CMD%" (
    ECHO Extracting Apache Maven...
    tar -xf "%MAVEN_ZIP%" -C "%MAVEN_DIR%"
)

:RUN_MAVEN
IF NOT EXIST "%MVN_CMD%" (
    ECHO [ERROR] mvn.cmd was not found at: %MVN_CMD%
    EXIT /B 1
)

"%MVN_CMD%" %*
EXIT /B %ERRORLEVEL%
