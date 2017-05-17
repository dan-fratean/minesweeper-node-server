#/!bin/bash
case "$1" in
    start)
		npm start
		;;

	rebuild)
		npm i -g npm-check-updates
		npm-check-updates -u
		npm install
	;;
esac

exit 0
