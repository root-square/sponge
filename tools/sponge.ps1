#*-----------------------------------------------------------------------------
#* Copyright (c) handbros(root-square). All rights reserved.
#* Version: 0.3.2(dev)
#* Released under the MIT license
#* https://github.com/root-square/sponge/blob/main/LICENSE
#*-----------------------------------------------------------------------------
#Requires -Version 7
#Requires -RunAsAdministrator

[CmdletBinding(PositionalBinding = $false)]
Param(
    [string][Alias('m')]$mode = "install",
    [switch]$noVerbose,
    [switch]$noLogo,
    [switch]$help,

    [string][Alias('v')]$vipsVersion = "latest",
    [string][Alias('s')]$spongeVersion = "latest",

    [switch]$ignoreWarnings
)

function Invoke-Startup {
    if ($nologo) {
        return
    }
    
    Write-Host "Sponge Patch Assistant"
    Write-Host "Copyright (c) 2024 handbros(root-square) all rights reserved."
    Write-Host ""
}

function Invoke-Help {
    Write-Host "Common options:"
    Write-Host "  -mode <value>              Patch Assistant operation mode: install, uninstall (short: m) (default: install)"
    Write-Host "  -noVerbose                 Doesn't display unnecessary messages"
    Write-Host "  -noLogo                    Doesn't display the startup banner or the copyright message"
    Write-Host "  -help                      Print help and exit"
    Write-Host ""
    Write-Host "Installation options:"
    Write-Host "  -vipsVersion <value>       Set a wasm-vips version to install (short: v) (default: latest)"
    Write-Host "  -spongeVersion <value>     Set a sponge version to install (short: s) (default: latest)"
    Write-Host ""
    Write-Host "Uninstallation options:"
    Write-Host "  -ignoreSX                  Ignore SX Container-related warnings"
}

function Invoke-Prepare {
    # Get a base directory.
    $Script:PackagePath = (Join-Path -Path "$($PSScriptRoot)" -ChildPath "./package.json").ToString()
    if ((Test-Path -Path $packagePath -PathType leaf) -eq $false) {
        Write-Error -Message "Cannot find the manifest file (package.json) in the current directory." -Category ObjectNotFound
        Exit-With-Code 1
    }

    $packageJson = Get-Content -Raw $Script:PackagePath | ConvertFrom-Json
    $script:BaseDirectory = (Split-Path -Path $packageJson.main -Parent -Resolve)

    # Get paths to use.
    try {
        $Script:IndexPath = (Join-Path -Path "$($script:BaseDirectory)" -ChildPath "./index.html" -Resolve).ToString()
        $Script:LibsPath = (Join-Path -Path "$($script:BaseDirectory)" -ChildPath "./js/libs" -Resolve).ToString()
    } catch {
        Exit-With-Code 1
    }
}

function Invoke-Install {
    # Set the package name.
    $hash = [System.Security.Cryptography.HashAlgorithm]::Create('sha256').ComputeHash([System.Text.Encoding]::UTF8.GetBytes((Get-Date -Format "dddd MM/dd/yyyy HH:mm.ms")))
    $hashString = [System.BitConverter]::ToString($hash).Replace('-', '')
    $packageJson = Get-Content $Script:PackagePath
    Out-File -FilePath $script:PackagePath -InputObject ($packageJson -replace "(?<=['""]name['""]\s?:\s?)['""]{1}.*['""]{1}", "`"$hashString`"") -Encoding UTF8

    # Download wasm-vips components.
    if ($vipsVersion.ToLower() -eq "latest") {
        $vipsVersion = "0.0"
    }

    try {
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips.js" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips.js")
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips.wasm" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips.wasm")
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips-heif.wasm" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips-heif.wasm")
        Invoke-WebRequest "https://cdn.jsdelivr.net/npm/wasm-vips@$($vipsVersion)/lib/vips-jxl.wasm" -OutFile (Join-Path -Path "$($script:LibsPath)" -ChildPath "./vips-jxl.wasm")
    } catch {
        Exit-With-Code 1
    }

    # Download Sponge components.
    $sponge 

    # Update the index.
    $contents = "<script type=`"text/javascript`" src=`"js/libs/vips.js`"></script>\n<script type=`"text/javascript`" src=`"js/libs/sponge.js`"></script>"
    $indexHtml = Get-Content $Script:IndexPath
    Out-File -FilePath $script:IndexPath -InputObject ($indexHtml.Insert($indexHtml.LastIndexOf("</script>") + 9, "\n$($contents)")) -Encoding UTF8
}

function Invoke-Uninstall {

}

function Exit-With-Code([int] $exitCode) {
    if ($ci -and $prepareMachine) {
        Stop-Processes
    }

    exit $exitCode
}

if ($help) {
    Invoke-Startup
    Invoke-Help

    exit 0
}

[timespan]$execTime = Measure-Command {
    Invoke-Startup | Out-Default
    Invoke-Prepare | Out-Default
    
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