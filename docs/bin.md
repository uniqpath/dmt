# Priority for executable binary scripts:
#
# ~/.dmt/bin
# ~/.dmt/user/bin
# ~/.dmt/user/devices/this/bin
#
# TODO:
# DEV_BIN=true [command] [args]
# when true, it goes directly to core/rust/target/release example or bin... searches everything
function platform_bin_command {
  local __result=''

  shift

  local _device_script="${DMT_DEVICE_PLATFORM_BIN}/$@"
  local _user_script="${DMT_USER_PLATFORM_BIN}/$@"
  local _fw_script="${DMT_PLATFORM_BIN}/$@"

  if [ -f "$_fw_script" ]; then
    __result="$_fw_script"
  elif [ -f "$_user_script" ]; then
    __result="$_user_script"
  elif [ -f "$_device_script" ]; then
    __result="$_device_script"
  else
    printf "${GRAY}Script $@ not found among device, user or fw scripts.${NC}\n"
    return 1
  fi

  eval "$1='${__result}'"
}
