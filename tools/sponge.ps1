#*-----------------------------------------------------------------------------
#* Copyright (c) handbros(root-square). All rights reserved.
#* Version: 0.3.2(dev)
#* Released under the MIT license
#* https://github.com/root-square/sponge/blob/main/LICENSE
#*-----------------------------------------------------------------------------
#Requires -Version 5.1
#Requires -RunAsAdministrator

[CmdletBinding(PositionalBinding = $false)]
Param(
    [string][Alias('m')]$mode = "none",
    [switch]$noVerbose,
    [switch]$noLogo,
    [switch]$help,

    [string][Alias('v')]$vipsVersion = "latest",
    [string][Alias('s')]$spongeVersion = "latest"
)

function Invoke-Title {
    if ($nologo) {
        return
    }
    
    Write-Host "Sponge Patch Assistant"
    Write-Host "Copyright (c) 2024 handbros(root-square) all rights reserved."
    Write-Host ""
}

function Invoke-Help {
    Write-Host "Common options:"
    Write-Host "  -mode <value>              Patch Assistant operation mode: none, install, uninstall (short: m) (default: none)"
    Write-Host "  -noVerbose                 Doesn't display unnecessary messages"
    Write-Host "  -noLogo                    Doesn't display the startup banner or the copyright message"
    Write-Host "  -help                      Print help and exit"
    Write-Host ""
    Write-Host "Version options:"
    Write-Host "  -vipsVersion <value>       Set a wasm-vips version to install (short: v) (default: latest)"
    Write-Host "  -spongeVersion <value>     Set a sponge version to install (short: s) (default: latest)"
}

function Invoke-Prepare {
    # Get a base directory.
    $Script:PackagePath = (Join-Path -Path "$($PSScriptRoot)" -ChildPath "./package.json").ToString()
    if ((Test-Path -Path $packagePath -PathType leaf) -eq $false) {
        Write-Error -Message "Cannot find the manifest file (package.json) in the current directory." -Category ObjectNotFound
        Exit-With-Code 1
    }

    $packageJson = Get-Content -Raw $Script:PackagePath -Encoding UTF8 | ConvertFrom-Json
    $script:BaseDirectory = (Split-Path -Path $packageJson.main -Parent -Resolve)

    # Get paths to use.
    try {
        $Script:IndexPath = (Join-Path -Path "$($script:BaseDirectory)" -ChildPath "./index.html" -Resolve).ToString()
        $Script:LibsPath = (Join-Path -Path "$($script:BaseDirectory)" -ChildPath "./js/libs" -Resolve).ToString()
    } catch {
        Exit-With-Code 1
    }

    # Check installation.
    $Script:IsAlreadyInstalled = (Test-Path -Path (Join-Path -Path "$($script:LibsPath)" -ChildPath "./sponge.js") -PathType leaf)
}

function Invoke-Install {
    if ($Script:IsAlreadyInstalled) {
        Write-Error -Message "The Sponge system has already been installed. If it had not been installed, despite the warning, please proceed with the manual installation." -Category InvalidOperation
        Exit-With-Code 1
    }

    Write-Warning "This script will install Sponge components in the current directory. Do not run the script unless it is provided by a trusted provider." -WarningAction Inquire
    Write-Host ""
    
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    # (1) Download wasm-vips components.
    try {
        Write-Host "Downloading wasm-vips resources..." -NoNewLine

        if ($vipsVersion.ToLower() -eq "latest") {
            $vipsVersion = "0.0"
        }
             
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips.js" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips.js")
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips.wasm" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips.wasm")
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips-heif.wasm" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips-heif.wasm")
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips-jxl.wasm" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips-jxl.wasm")
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Error -Message "Failed to download wasm-vips resources. Please check your network connection and the version string." -Category OperationStopped
        Exit-With-Code 1
    }

    # (2) Download Sponge components.
    try {
        Write-Host "Downloading Sponge resources..." -NoNewLine

        if ($spongeVersion.ToLower() -eq "latest") {
            $zipballUrl = (Invoke-WebRequest 'https://api.github.com/repos/root-square/sponge/releases/latest' | ConvertFrom-Json).zipball_url
        } else {
            $zipballUrl = (Invoke-WebRequest "https://api.github.com/repos/root-square/sponge/releases/tags/v$($spongeVersion)" | ConvertFrom-Json).zipball_url
        }
        
        $tempFolderPath = Join-Path $Env:Temp $(New-Guid)
        New-Item -Type Directory -Path $tempFolderPath | Out-Null
        Invoke-WebRequest "$($zipballUrl)" -OutFile (Join-Path -Path "$($tempFolderPath)" -ChildPath "./sponge.zip")
        
        Expand-Archive -LiteralPath (Join-Path -Path "$($tempFolderPath)" -ChildPath "./sponge.zip") -DestinationPath "$($tempFolderPath)"
        Copy-Item -Path (Join-Path -Path "$($tempFolderPath)" -ChildPath "./root-square-sponge-*/libs/*") -Destination "$($script:LibsPath)" -Recurse -Force
        Remove-Item -Path "$($tempFolderPath)" -Recurse -Force

        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Error -Message "Failed to download Sponge resources. Please check your network connection and the version string." -Category OperationStopped
        Exit-With-Code 1
    }

    # (3) Update the package name.
    try {
        Write-Host "Updating the NW.js manifest package name..." -NoNewLine
        
        $hash = [System.Security.Cryptography.HashAlgorithm]::Create('sha256').ComputeHash([System.Text.Encoding]::UTF8.GetBytes((Get-Date -Format "dddd MM/dd/yyyy HH:mm.ms")))
        $hashString = [System.BitConverter]::ToString($hash).Replace('-', '')
        $packageJson = Get-Content $Script:PackagePath -Encoding UTF8
        Out-File -FilePath $script:PackagePath -InputObject ($packageJson -replace "(?<=['""]name['""]\s?:\s?)['""]{1}.*['""]{1}", "`"$hashString`"") -Encoding UTF8
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Error -Message "Failed to update NW.js manifest package name. It may not be possible to run the game." -Category OperationStopped
    }

    # (4) Update the index page.
    try {
        Write-Host "Updating the index page..." -NoNewLine
        
        $indexHtml = Get-Content -Raw $Script:IndexPath -Encoding UTF8
        $indents = (Get-Content $Script:IndexPath -Encoding UTF8 | Select-String '^.*(?=<script)' | %{ $_.Matches } | %{ $_.Value })[0]
        $contents = "$($indents)<script type=`"text/javascript`" src=`"js/libs/vips.js`"></script>`n$($indents)<script type=`"text/javascript`" src=`"js/libs/sponge.js`"></script>"
        Out-File -FilePath $script:IndexPath -InputObject ($indexHtml.Insert($indexHtml.LastIndexOf("</script>") + "</script>".Length, "`n$($contents)")) -Encoding UTF8
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Error -Message "Failed to update the index page. It may not be possible to run the game." -Category OperationStopped
    }
}

function Invoke-Uninstall {
    if ($Script:IsAlreadyInstalled -eq $false) {
        Write-Error -Message "The Sponge system has not been installed. If it had not been uninstalled, despite the warning, please proceed with the manual uninstallation." -Category InvalidOperation
        Exit-With-Code 1
    }
    
    Write-Warning "This script will uninstall Sponge components in the current directory. Are you sure you want to run it?" -WarningAction Inquire
    Write-Host ""

    # (1) Remove components.
    try {
        Write-Host "Removing components..." -NoNewLine

        Remove-Item (Join-Path -Path "$($script:LibsPath)" -ChildPath "./sponge") -Recurse -Force
        Remove-Item (Join-Path -Path "$($script:LibsPath)" -ChildPath "./sponge.js") -Force
        Remove-Item (Join-Path -Path "$($script:LibsPath)" -ChildPath "./sponge.json") -Force
        Remove-Item (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips.js") -Force
        Remove-Item (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips.wasm") -Force
        Remove-Item (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips-heif.wasm") -Force
        Remove-Item (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips-jxl.wasm") -Force
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Error -Message "Failed to remove components. Please check your system privilege." -Category OperationStopped
        Exit-With-Code 1
    }

    # (2) Update the index page.
    try {
        Write-Host "Updating the index page..." -NoNewLine
        
        (Get-Content $script:IndexPath -Encoding UTF8 | Select-String -Pattern '<script(.*)src="js/libs/(vips|sponge).js"(.*)script>' -NotMatch) | Set-Content $script:IndexPath -Encoding UTF8
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Error -Message "Failed to update the index page. It may not be possible to run the game." -Category OperationStopped
    }
}

function Exit-With-Code([int] $exitCode) {
    if ($ci -and $prepareMachine) {
        Stop-Processes
    }

    exit $exitCode
}

if ($help) {
    Invoke-Title
    Invoke-Help

    exit 0
}

[timespan]$execTime = Measure-Command {
    Invoke-Title | Out-Default
    Invoke-Prepare | Out-Default
    
    if ($mode.ToLower() -eq "none") {
        Write-Host "  1. Install"
        Write-Host "  2. Uninstall"
        Write-Host ""

        $selection = Read-Host "Select an operation"
        switch ($selection) {
            '1' {
                $mode = "install"
            }
            '2' {
                $mode = "uninstall"
            }
            default {
                Exit-With-Code 1
            }
        }
    }
    
    if ($mode.ToLower() -eq "install") {
        Invoke-Install | Out-Default
    } elseif ($mode.ToLower() -eq "uninstall") {
        Invoke-Uninstall | Out-Default
    } else {
        Write-Error -Message "Unable to find the specified operation mode." -Category InvalidArgument
        Exit-With-Code 1
    }
}

Write-Host "Finished in " -NoNewline
Write-Host ("{0:d2}:{1:d2}.{2:d4}" -f $($execTime.Minutes), $($execTime.Seconds), $($execTime.Milliseconds)) -ForegroundColor Blue

Write-Host "Finished at " -NoNewline
Write-Host "$(Get-Date -Format "MM/dd/yyyy HH:mm")" -ForegroundColor Blue