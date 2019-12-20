extern crate walkdir;
extern crate regex;
extern crate colored;

use walkdir::WalkDir;

use regex::Regex;
use colored::*;

use std::env;
use std::fs::File;
use std::io::{BufRead, BufReader, Result};

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
}

fn regex_helper(x: &str) -> String {
  if x.starts_with("@media=") {
    match x.replace("@media=", "").as_ref() {
      "music" => format!("(?P<match>\\.(mp3|m4a|flac|ogg))$"), 
      "video" => format!("(?P<match>\\.(mp4|mkv|avi|webm))$"),
      "photo" => format!("(?P<match>\\.(png|jpg|jpeg|gif|tiff))$"),
      _ => "".to_string() 
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

fn main() -> Result<()> {
    let mut args: Vec<String> = env::args().collect();

    args.remove(0);

    let mut catalog: Option<String> = None;

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
      color = false;
      args.remove(0);
    }

    let terms = &mut args;

    terms.sort();
    terms.dedup();

    let regs: Vec<Regex> = terms.iter().filter(|x| !x.starts_with('-')).map(|x|
      create_regex(&regex_helper(x))
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
        for entry in WalkDir::new(".") {
            let entry = entry.unwrap();
            let line = entry.path().display().to_string();
            if let Some(result) = line_matches(line, color, &regs, &neg_regs, &temp_re) {
                let mut cur_dir = env::current_dir().unwrap();
                if color {
                  println!("{}{}", format!("{}/", cur_dir.to_str().unwrap().black().bold()), Regex::new("^\\./").unwrap().replace(&result, ""));
                } else {
                  println!("{}{}", format!("{}/", cur_dir.display()), Regex::new("^\\./").unwrap().replace(&result, ""));
                }
            }
        }
      }
    }

    Ok(())
}
