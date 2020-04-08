
function runTests {
  for file in "${@:2}"; do
    echo ${file}
    touch "${file}.out"
    "$1" ${file} 2>&1 | diff "${file}.out" -
  done
}

function commit {
  for file in "${@:2}"; do
    echo "${file}.out"
    touch "${file}.out"
    "$1" ${file} 2>&1 | diff "${file}.out" -
    "$1" ${file} &> "${file}.out"
  done
}

if [[ "$1" == "--commit" ]]; then
  commit "${@:2}"
else
  runTests "${@:2}"
fi
