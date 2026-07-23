# CLAUDE_CONFIG_DIR overrides ~/.claude, matching where the hooks write the flag.
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME ".claude" }
$Flag = Join-Path $ClaudeDir ".carmy-active"
if (-not (Test-Path $Flag)) {
    exit 0
}

$Mode = ""
try {
    $Mode = (Get-Content $Flag -ErrorAction Stop | Select-Object -First 1).Trim()
} catch {
    exit 0
}

$Esc = [char]27
# hot is the louder mode; flag it amber so it stands out from the default cold
# green. The mode is still in the text, so color is a redundant cue.
$Color = if ($Mode -eq "hot") { "173" } else { "108" }
if ([string]::IsNullOrEmpty($Mode) -or $Mode -eq "cold") {
    [Console]::Write("${Esc}[38;5;${Color}m[CARMY]${Esc}[0m")
} else {
    $Suffix = $Mode.ToUpperInvariant()
    [Console]::Write("${Esc}[38;5;${Color}m[CARMY:$Suffix]${Esc}[0m")
}
