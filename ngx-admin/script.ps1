$lines = Get-Content "c:\Users\plant\Escuela utm\Integrador-2026\ngx-admin\src\app\@core\services\cliente-firebase.service.ts"
$indentLevel = 0
for ($i=0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $openCount = ($line.ToCharArray() | Where-Object {$_ -eq '{'}).Count
    $closeCount = ($line.ToCharArray() | Where-Object {$_ -eq '}'}).Count
    $indentLevel += $openCount - $closeCount

    if ($indentLevel -eq 2 -and $closeCount -gt 0) {
        # ignore
    } elseif ($openCount -gt $closeCount -or $closeCount -gt $openCount) {
        Write-Host "$($i+1): $indentLevel : $line"
    }
}
