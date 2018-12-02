package main

import (
    "bufio"
    "fmt"
    "os"
    "os/user"
    "regexp"
    "log"
)

// Reading files requires checking most calls for errors.
// This helper will streamline our error checks below.
func check(e error) {
    if e != nil {
      panic(e)
    }
}

func IsDirectory(path string) (bool) {
    if info, err := os.Stat(path); err == nil && info.IsDir() {
      return true
    } else {
      return false
    }
}

func main() {

    if(len(os.Args) != 2) {
      fmt.Println("Usage: go ssh_parse_host.go server")
      return
    }

    server := os.Args[1]

    usr, err := user.Current()
    if err != nil {
        log.Fatal( err )
    }

    file, err := os.Open(usr.HomeDir + "/.ssh/config")
    check(err)
    defer file.Close()

    re, err := regexp.Compile("(?i)^\\s*Host\\s+(" + server + ".*?)$")

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        res := re.FindStringSubmatch(scanner.Text())
        if(len(res) > 0) {
          fmt.Println(res[1])
          return
        }
    }

    check(scanner.Err())
}
