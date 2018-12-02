priority:

local _device_script="${DMT_DEVICE_PLATFORM_BIN}/$@"
  local _user_script="${DMT_USER_PLATFORM_BIN}/$@"
  local _fw_script="${DMT_PLATFORM_BIN}/$@"

  if [ -f "$_device_script" ] && [ ! $CORE_BIN ]; then
    __result="$_device_script"
  elif [ -f "$_user_script" ] && [ ! $CORE_BIN ]; then
    __result="$_user_script"
  elif [ -f "$_fw_script" ]; then
    __result="$_fw_script"
  else
    printf "${GRAY}Script $@ not found among device, user or fw scripts.${NC}\n"
    return 1
  fi

---

to force back the framework version and don't override with user or device binary, use:

CORE_BIN=true command




