extern crate walkdir;
extern crate regex;
extern crate colored;

use walkdir::WalkDir;

use regex::Regex;
use colored::*;

use std::process;
use std::env;
use std::fs::File;
use std::fs::metadata;
use std::io::{BufRead, BufReader, Result};

use std::path::{Path, PathBuf};

fn create_regex(re: &str) -> Regex {
  Regex::new(&format!("(?i){}", re)).unwrap()
}

fn escape(x: &str) -> String {
  let escaped = regex::escape(x);

  let c = "[cćč]";
  let balkan_c = Regex::new(&format!("(?i){}", c)).unwrap();
  let result = balkan_c.replace_all(&escaped, c);

  let s = "[sš]";
  let balkan_s = Regex::new(&format!("(?i){}", s)).unwrap();
  let result = balkan_s.replace_all(&result, s);

  let z = "[zž]";
  let balkan_z = Regex::new(&format!("(?i){}", z)).unwrap();
  let result = balkan_z.replace_all(&result, z);

  result.into_owned()

  // TODO: BENCHMARK -- seems plenty fast but check if it can be done faster still
  // TODO: also try to incorporate more powerful normalization as in dmt.util.normalizeStr(..) -- Remove accents/diacritics etc.
  //regex::escape(x)
}

fn regex_helper(x: &str) -> String {
  if x.starts_with("@media=") {
    match x.replace("@media=", "").as_ref() {
      // warning: keep in sync with dmt-meta/.../detectMediaType.js
      "music" => format!("(?P<match>\\.(mp3|m4a|flac|ogg|wav))$"), // warning: m4a can also be video (?)
      "video" => format!("(?P<match>\\.(mp4|mkv|avi|webm))$"),
      "photo" => format!("(?P<match>\\.(png|jpg|jpeg|gif|tiff|svg))$"),
      "pdf" => format!("(?P<match>\\.(pdf))$"),
      "txt" => format!("(?P<match>\\.(txt))$"),
      _ => panic!("Unknown media format: {:?}", x) // if unrecognized format is passed, we match everything ...
    }
  } else {
    match x.chars().next().unwrap() {
      '~' => format!("\\b(?P<match>{})\\b", escape(&x[1..])).replace("\\|", "|"),
      _ => format!("(?P<match>{})", escape(x)).replace("\\|", "|"),
    }
  }
}

fn line_matches(line: String, color: bool, regs: &Vec<Regex>, neg_regs: &Vec<Regex>, temp_re: &Regex) -> Option<String> {
  let mut found = true;

  for re in regs.iter() {
    if !re.is_match(&line) {
      found = false;
      break;
    }
  }

  for re in neg_regs.iter() {
    if re.is_match(&line) {
      found = false;
      break;
    }
  }

  if found {
    let mut result = line;

    if color {
      for re in regs.iter() {
          result = re.replace_all(&result, "$pre_match@_!_@$match@_!_@$post_match").into_owned();
      }

      result = temp_re.replace_all(&result, |caps: &regex::Captures| {
          caps[1].cyan().to_string()
      }).into_owned();
    }

    return Some(result);
  }

  return None;
}

// todo:
// !!! author:einstein
// !!! >2017
// OK: " "
// OK: a|b|c
// ok: \bsomething\b
//

// cargo build --release; if [ $? -eq 0 ]; then ~/Projects/rust/search_catalog/target/release/search_catalog ~/Desktop/test.txt author:dav; fi
// cargo build --release; if [ $? -eq 0 ]; then z @lib einstein author:bisac; fi

fn main() -> Result<()> {
    let mut args: Vec<String> = env::args().collect();

    args.remove(0);
    // if args.len() == 0 {
    //   println!("Missing any arguments!");
    //   std::process::exit(0x0100);
    // }

    //println!("{:?}", args);

    let mut catalog: Option<String> = None;

    // OPTIONS:

    // --fs ● searches the file system current directory tree
    // --catalog [file] ● searches over a list of files (or anything else) inside a file
    // --total ● uses first two, --fs to iterate over all files and --catalog to search each file

    if args.len() > 0 && args[0] == "--catalog" {
      args.remove(0);
      if args.len() == 0 {
        println!("Missing catalog file!");
        std::process::exit(0x0100);
      }
      catalog = Some(args[0].clone());
      args.remove(0);
    }

    let mut color = true;

    if args.len() > 0 && args[0] == "--no-color" {
      //println!("■ color = false");
      color = false;
      args.remove(0);
    }

    let mut onlyFiles = false;

    if args.len() > 0 && args[0] == "--only-files" {
      onlyFiles = true;
      args.remove(0);
    }

    let mut searchAbsolutePath = false;

    if args.len() > 0 && args[0] == "--search-absolute-path" {
      searchAbsolutePath = true;
      args.remove(0);
    }

    let terms = &mut args;

    //println!("● {:?}", terms);

    terms.sort();
    terms.dedup();

    let regs: Vec<Regex> = terms.iter().filter(|x| !x.starts_with('-')).map(|x|
      //if x.starts_with("author:") {
      //  create_regex(&format!("(?P<pre_match>\t.*?\t.*?){}(?P<post_match>.*?\t)", regex_helper(&x.replace("author:", ""))))
      //} else {
      create_regex(&regex_helper(x))
      //}
    ).collect();

    let neg_regs: Vec<Regex> = terms.iter().filter(|x| x.starts_with('-')).map(|x| Regex::new(&format!("(?i){}", escape(&x[1..]))).unwrap()).collect();

    let temp_re = Regex::new("@_!_@(.*?)@_!_@").unwrap();

    match catalog {

      Some(value) => {
        let file = File::open(value)?;
        for line in BufReader::new(file).lines() {
            let line = line?;
            if let Some(result) = line_matches(line, color, &regs, &neg_regs, &temp_re) {
                println!("{}", result);
            }
        }
      },

      None => {
        let mut cur_dir = env::current_dir().unwrap();

        //let cwd = env::current_dir()?;
        for entry in WalkDir::new(".") {

            let entry = entry.unwrap();
            let mut line;

            //let line = format!("{}{}/", cur_dir.display(), Regex::new("^\\./").unwrap().replace(&entry.path().display().to_string(), ""));

            if searchAbsolutePath {
              let relative_path = format!("{}", Regex::new("^\\./").unwrap().replace(&entry.path().display().to_string(), ""));
              line = Path::new(cur_dir.to_str().unwrap()).join(relative_path).display().to_string();
            } else {
              line = entry.path().display().to_string();
            }
            // let absolute_path = Path::new(cur_dir.to_str().unwrap()).join(Regex::new("^\\./").unwrap().replace(entry.path(), ""));

            //println!("LINE -- {}", line.to_str().unwrap());

            // let md = metadata(&line).unwrap();

            let md = metadata(&line);

            let md = match md {
                Ok(handle) => handle,
                Err(error) => {
                  //panic!("Problem opening the file: {:?} -- {}", error, line)
                  eprintln!("Problem opening the file (symlink?): {}", line.red().bold());
                  //process::exit(1);
                  continue;
                },
            };

            if !onlyFiles || !md.is_dir() {

                if let Some(result) = line_matches(line, color, &regs, &neg_regs, &temp_re) {
                    if searchAbsolutePath {
                        println!("{}", &result);
                    } else {
                        if color {
                            println!("{}{}", format!("{}/", cur_dir.to_str().unwrap().black().bold()), Regex::new("^\\./").unwrap().replace(&result, ""));
                        } else {
                            println!("{}{}", format!("{}/", cur_dir.display()), Regex::new("^\\./").unwrap().replace(&result, ""));
                        }
                    }
                }

            }
        }
      }
    }

    Ok(())
}
