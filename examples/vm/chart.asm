-- Display the numbers in memory as a bar chart.
-- You can hard-code the length of the memory into the program.
-- If you need to find the maximum value in memory you should
-- do so programatically (not hard-coded).
-- 
-- For the numbers 1 4 2 7 3 1the output should be:
--
--    X
--    X
--    X
--  X X
--  X XX
--  XXXX
-- XXXXXX

init 1 4 2 7 3 1
load r2 r0
gt r2 r1
jeq 2 r2 0
load r1 r0
add r0 1
jne -5 r0 5
jeq 15 r1 0
set r0 0
jeq 9 r0 6
load r2 r0
lt r2 r1
jeq 3 r2 0
print 32
jmp 2
print 88
add r0 1
jmp -8
sub r1 1
jeq 2 r1 0
print 10
jmp -14
print 10
halt
