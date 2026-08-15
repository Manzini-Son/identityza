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
#include <chrono>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <ios>
#include <iostream>
#include <sstream>
#include <string>
#include <utility>

using namespace std;

// Function to create a file called id_numbers.txt if it does not exist and
void create_id_number_file() {
  // check if the file exists
  ifstream id_file("id_numbers.txt");
  if (id_file.is_open()) {
    id_file.close();
    return;
  } else {
    // create the file
    ofstream id_file("id_numbers.txt");
    id_file.close();
  }
}
// Function to save user input and output to a file
void save_user_input(const string &id_number, const string &output) {
  // open the file in append mode
  ofstream id_file("id_numbers.txt", ios::app);
  // write the id number to the file
  id_file << "ID Number: " << id_number << endl;
  // write the output to the file
  id_file << output << endl;
  // close the file
  id_file.close();
}

string id_number_info(const string &id_number) {
  // ID number must be exactly 13 digits no letters, spaces or special
  // characters
  if (id_number.length() != 13) {
    cout << "Invalid ID number. It must be exactly 13 digits." << endl;
    return "";
  }

  for (char c : id_number) {
    if (!isdigit(c)) {
      cout << "Invalid ID number. It must be exactly 13 digits." << endl;
      return "";
    }
  }

  // Extract date of birth
  int yy = stoi(id_number.substr(0, 2));
  int mm = stoi(id_number.substr(2, 2));
  int dd = stoi(id_number.substr(4, 2));

  // Determine century (assume 1900-1999 if year > current year, else 2000+)
  auto now = chrono::system_clock::now();
  auto time = chrono::system_clock::to_time_t(now);
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
    cout << "Invalid date of birth in ID number." << endl;
    return "";
  }

  // Format date of birth
  ostringstream dob_stream;
  dob_stream << setfill('0') << setw(4) << year << "-" << setw(2) << mm << "-"
             << setw(2) << dd;
  string dob_str = dob_stream.str();

  // Calculate age (reuse local_time from above)
  int today_year = local_time->tm_year + 1900;
  int today_month = local_time->tm_mon + 1;
  int today_day = local_time->tm_mday;

  int age = today_year - year;
  if (make_pair(today_month, today_day) < make_pair(mm, dd)) {
    age--;
  }

  // Gender (digits 7-10 form a 4-digit sequence: >= 5000 = Male, < 5000 =
  // Female)
  int gender_seq = stoi(id_number.substr(6, 4));
  string gender = gender_seq >= 5000 ? "Male" : "Female";

  // Citizenship
  int citizenship_digit = stoi(id_number.substr(10, 1));
  string citizenship =
      citizenship_digit == 0 ? "SA Citizen" : "Permanent Resident";

  // Validity check using the Luhn algorithm
  int luhn_sum = 0;
  string odd_digits, even_digits_str;
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
  int even_num = stoi(even_digits_str) * 2;
  string even_doubled = to_string(even_num);
  for (char c : even_doubled) {
    luhn_sum += c - '0';
  }
  bool valid = (luhn_sum % 10 == 0);

  // Build output string
  ostringstream out;
  out << "Date of Birth: " << dob_str << "\n"
      << "Age: " << age << "\n"
      << "Gender: " << gender << "\n"
      << "Citizenship: " << citizenship << "\n"
      << "ID Number Validity: " << (valid ? "Valid" : "Invalid");
  string result = out.str();
  cout << result << endl;
  return result;
}

int main() {
  string id_number;
  cout << "Welcome to the identityza app!" << endl;
  create_id_number_file();
  cout << "Please enter a South African ID number: ";
  getline(cin, id_number);
  string output = id_number_info(id_number);
  if (!output.empty()) {
    save_user_input(id_number, output);
  }
  cout << "Thank you for using our service." << endl;

  while (true) {
    cout << "Would you like to check another ID number? (yes/no): ";
    getline(cin, id_number);

    // Convert to lowercase and trim whitespace (equivalent to strip().lower())
    string trimmed = id_number;

    // Trim leading and trailing whitespace
    size_t start = trimmed.find_first_not_of(" \t\n\r");
    size_t end = trimmed.find_last_not_of(" \t\n\r");
    trimmed =
        (start != string::npos) ? trimmed.substr(start, end - start + 1) : "";

    // Convert to lowercase
    transform(trimmed.begin(), trimmed.end(), trimmed.begin(), ::tolower);

    if (trimmed == "yes" || trimmed == "y") {
      cout << "Please enter a South African ID number: ";
      getline(cin, id_number);
      output = id_number_info(id_number);
      if (!output.empty()) {
        save_user_input(id_number, output);
      }
      cout << "Thank you for using our service." << endl;
    } else if (trimmed == "no" || trimmed == "n") {
      cout << "Exiting the program. Goodbye!" << endl;
      break;
    } else {
      cout << "Invalid input. Please enter 'yes' or 'no'." << endl;
      continue;
    }
  }

  return 0;
}
