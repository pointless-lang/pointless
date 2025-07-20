-- compute and display the factorial of the number in r0

set r0 10
set r1 1
jeq 4 r0 0
mul r1 r0
sub r0 1
jmp -3
halt
