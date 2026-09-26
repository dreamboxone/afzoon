#!/bin/sh
set -eu
SOURCE=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
eval "$(sed -n '/^json_quote()/,/^case "\$1" in/p' "$SOURCE/files/usr/sbin/afzoonctl" | sed '$d')"

jsonfilter() {
	if [ "$1" = -i ]; then
		node -e 'const fs=require("fs");const j=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));const v=j[process.argv[2].slice(2)];if(v!==undefined)console.log(v)' "$2" "$4"
	else
		node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const v=JSON.parse(s)[process.argv[1].slice(2)];if(v!==undefined)console.log(v)});' "$2"
	fi
}
apply() {
	sleep "${AFZOON_TEST_DELAY:-4}"
	printf 'Formatting progress\n'
	case "${AFZOON_TEST_RESULT:-success}" in
		success) printf '{"ok":true,"reboot_required":true}\n';;
		failure) reply_error 'Simulated format failure';;
		invalid) printf 'Unexpected tool output\n';;
	esac
}

if [ "${1:-}" = apply-worker ]; then
	STATE_DIR=$AFZOON_TEST_STATE
	JOB_LOCK=$STATE_DIR/apply.lock
	JOB_FILE=$STATE_DIR/apply-job.json
	shift
	set +e
	apply_worker "$@"
	exit
fi

STATE_DIR=$(mktemp -d /tmp/afzoon-job-test.XXXXXX)
JOB_LOCK=$STATE_DIR/apply.lock
JOB_FILE=$STATE_DIR/apply-job.json
export AFZOON_TEST_STATE=$STATE_DIR
started=$(date +%s)
result=$(start_apply /dev/sda 128 256)
elapsed=$(( $(date +%s) - started ))
[ "$elapsed" -lt 2 ]
job=$(printf '%s\n' "$result" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);if(!j.ok||!j.running)process.exit(1);console.log(j.job_id)});')
start_apply /dev/sda 128 256 | grep -q 'already in progress'
safe_remove /dev/sda | grep -q 'already in progress'
disable_extroot | grep -q 'already in progress'
apply_status wrong-job | grep -q 'Unknown Apply operation'
while :; do
	result=$(apply_status "$job")
	if ! printf '%s\n' "$result" | grep -q '"running":true'; then break; fi
	sleep 1
done
printf '%s\n' "$result" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);const mode=process.env.AFZOON_TEST_RESULT||"success";if(mode==="success"?(!j.ok||!j.reboot_required):j.ok!==false)process.exit(1)});'
while [ -d "$JOB_LOCK" ]; do sleep 1; done
printf 'PASS: async Apply %s; start returned in %ss; worker delay %ss\n' "${AFZOON_TEST_RESULT:-success}" "$elapsed" "${AFZOON_TEST_DELAY:-4}"
