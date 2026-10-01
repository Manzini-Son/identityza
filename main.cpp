/*This is the main.cpp file for the identityza application.
 *It is a C++ program that takes a South African ID number as input and provides
 * information about the individual, such as date of birth, age, gender,
 * citizenship, and validity of the ID number. The program also allows the user
 * to check an unlimited number of ID numbers in a loop until they choose to
 * exit. This program does not use any external libraries from the South African
 * Government, partners or other third parties and is designed to be simple and
 * user-friendly. identityza.cpp
 *
 *  Created on: 2026-08-12
 *      Author: Andile Danse
 */
#include <algorithm>
#include <cctype>
#include <chrono>
#include <cstddef>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <ios>
#include <iostream>
#include <sstream>
#include <string>
#include <utility>
#include <thread>
#include <chrono>

using namespace std::chrono;


// Prototypes of functions
void runProgram();
void createIdNumberDatabaseFile();
void saveUserInputToDatabase(const std::string &id_number, const std::string &output);
// Function to create a file called id_numbers.txt if it does not exist and
void createIdNumberDatabaseFile() {
  // check if the file exists
  std::ifstream id_file("id_numbers.txt");
  if (id_file.is_open()) {
    id_file.close();
    return;
  } else {
    // create the file
    std::ofstream id_file("id_numbers.txt");
    id_file.close();
  }
}
// Function to save user input and output to a file
void saveUserInputToDatabase(const std::string &id_number, const std::string &output) {
  // open the file in append mode
  std::ofstream id_file("id_numbers.txt", std::ios::app);
  // write the id number to the file
  id_file << "ID Number: " << id_number << '\n';
  // write the output to the file
  id_file << output << '\n';
  // close the file
  id_file.close();
}
// Parse ID Number
std::string id_number_info(const std::string &id_number) {
  // ID number must be exactly 13 digits no letters, spaces or special
  // characters
  if (id_number.length() != 13) {
    std::cout << "Invalid ID number. It must be exactly 13 digits." << '\n';
    return "";
  }

  for (char c : id_number) {
    if (!std::isdigit(static_cast<unsigned char>(c))) {
      std::cout << "Invalid ID number. It must be exactly 13 digits." << '\n';
      return "";
    }
  }
  // extract the date of birth from South African ID number
  
  int yy = std::stoi(id_number.substr(0, 2));
  int mm = std::stoi(id_number.substr(2, 2));
  int dd = std::stoi(id_number.substr(4, 2));
  
  // Determine century (assume 1900-1999 if year > current year, else 2000+)
  auto now = std::chrono::system_clock::now();
  auto time = std::chrono::system_clock::to_time_t(now);
  tm *local_time = localtime(&time);
  int current_year = (local_time->tm_year + 1900) % 100;
  int century = yy > current_year ? 1900 : 2000;
  int year = century + yy;

  // Validate date
  tm timeinfo = {};
  timeinfo.tm_year = year - 1900;
  timeinfo.tm_mon = mm - 1;
  timeinfo.tm_mday = dd;
  timeinfo.tm_isdst = -1;

  time_t test_time = mktime(&timeinfo);
  if (test_time == -1 || timeinfo.tm_year + 1900 != year ||
      timeinfo.tm_mon + 1 != mm || timeinfo.tm_mday != dd) {
    std::cout << "Invalid date of birth in ID number." << '\n';
    return "";
  }

  // Format date of birth
  std::stringstream dob_stream;
  dob_stream << std::setfill('0') << std::setw(4) << year << "-" << std::setw(2) << mm << "-"
             << std::setw(2) << dd;
  std::string dob_str = dob_stream.str();

  // Calculate age (reuse local_time from above)
  int today_year = local_time->tm_year + 1900;
  int today_month = local_time->tm_mon + 1;
  int today_day = local_time->tm_mday;

  int age = today_year - year;
  if (std::make_pair(today_month, today_day) < std::make_pair(mm, dd)) {
    age--;
  }

  // Gender (digits 7-10 form a 4-digit sequence: >= 5000 = Male, < 5000 =
  // Female)
  int gender_seq = std::stoi(id_number.substr(6, 4));
  std::string gender = gender_seq >= 5000 ? "Male" : "Female";

  // Citizenship
  int citizenship_digit = std::stoi(id_number.substr(10, 1));
  std::string citizenship =
      citizenship_digit == 0 ? "SA Citizen" : "Permanent Resident";

  // Validity check using the Luhn algorithm
  int luhn_sum = 0;
  std::string odd_digits, even_digits_str;
  for (int i = 0; i < 13; i++) {
    if (i % 2 == 0) {
      odd_digits += id_number[i];
    } else {
      even_digits_str += id_number[i];
    }
  }
  // Sum of odd-positioned digits (1st, 3rd, 5th, ...)
  for (char c : odd_digits) {
    luhn_sum += c - '0';
  }
  // Concatenate even-positioned digits, multiply by 2, sum the resulting digits
  int even_num = std::stoi(even_digits_str) * 2;
  std::string even_doubled = std::to_string(even_num);
  for (char c : even_doubled) {
    luhn_sum += c - '0';
  }
  bool valid = (luhn_sum % 10 == 0);

  // Build output string
  std::ostringstream out;
  out << "Date of Birth: " << dob_str << "\n"
      << "Age: " << age << "\n"
      << "Gender: " << gender << "\n"
      << "Citizenship: " << citizenship << "\n"
      << "ID Number Validity: " << (valid ? "Valid\n" : "Invalid\n")
      << "-------------------------------------------------------\n";
  std::string result = out.str();
  std::cout << result << '\n';
  return result;
}

void runProgram() {
  std::cout << "Note: identityza has no affiliation whatsoever with the South African government or third parties.\n";
  while (true) {
    std::cout << "Please enter a South African ID number: ";
    std::string id_number;
    std::getline(std::cin, id_number);
     // Convert to lowercase and trim whitespace (equivalent to strip().lower())
    std::string trimmed = id_number;
    std::string output = id_number_info(id_number);
    // Convert to lowercase
    std::transform(trimmed.begin(), trimmed.end(), trimmed.begin(),
                   [](unsigned char c) { return std::tolower(c); });
     // Trim leading and trailing whitespace
    size_t start = trimmed.find_first_not_of(" \t\n\r");
    size_t end = trimmed.find_last_not_of(" \t\n\r");
    trimmed = (start != std::string::npos) ? trimmed.substr(start, end - start + 1) : "";
    if (!output.empty()) {
      saveUserInputToDatabase(id_number, output);
    }
    std::cout << "Would you like to check another ID number? (yes/no): ";
    std::string choice;
    std::getline(std::cin, choice);
    if (choice == "y" || choice == "yes") {
      continue;
    } else if (choice == "n" || choice == "no") {
      std::cout << "Thank you for using the program. Goodbye!\n";
      std::this_thread::sleep_for(std::chrono::seconds(2));
      exit(0);
    }
    else {
      std::cout << "Please enter either Y or N\n";
      continue;
    }
  }
  return;
}

int main() {
  std::cout << "Welcome to the identityza app!" << '\n';
  while (true) {
  createIdNumberDatabaseFile();
  runProgram();
  }
return 0;
}
