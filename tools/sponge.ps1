#*-----------------------------------------------------------------------------
#* Copyright (c) handbros(root-square). All rights reserved.
#* Version: 0.2.0(dev)
#* Released under the MIT license
#* https://github.com/root-square/sponge/blob/main/LICENSE
#*-----------------------------------------------------------------------------
[CmdletBinding(PositionalBinding = $false)]
Param(
    [string][Alias('v')]$verbosity = "minimal",
    [switch]$noLogo,
    [switch]$help,
    
    [Parameter(ValueFromRemainingArguments = $true)][String[]]$properties
)
