#include <iostream>
#include <string>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <algorithm>
#include <utility>
#include <ctime>

using namespace std;

void id_number_info(const string& id_number) {
    // Validate ID number
    if (id_number.length() != 13) {
        cout << "Invalid ID number. It must be exactly 13 digits." << endl;
        return;
    }
    
    for (char c : id_number) {
        if (!isdigit(c)) {
            cout << "Invalid ID number. It must be exactly 13 digits." << endl;
            return;
        }
    }
    
    // Extract date of birth
    int yy = stoi(id_number.substr(0, 2));
    int mm = stoi(id_number.substr(2, 2));
    int dd = stoi(id_number.substr(4, 2));
    
    // Determine century (assume 1900-1999 if year > current year, else 2000+)
    auto now = chrono::system_clock::now();
    auto time = chrono::system_clock::to_time_t(now);
    tm* local_time = localtime(&time);
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
        return;
    }
    
    // Format date of birth
    ostringstream dob_stream;
    dob_stream << setfill('0') << setw(4) << year << "-" 
              << setw(2) << mm << "-" << setw(2) << dd;
    string dob_str = dob_stream.str();
    
    // Calculate age
    auto today = chrono::system_clock::now();
    auto today_time = chrono::system_clock::to_time_t(today);
    tm* today_tm = localtime(&today_time);
    
    int today_year = today_tm->tm_year + 1900;
    int today_month = today_tm->tm_mon + 1;
    int today_day = today_tm->tm_mday;
    
    int age = today_year - year;
    if (make_pair(today_month, today_day) < make_pair(mm, dd)) {
        age--;
    }
    
    // Gender
    int gender_digit = stoi(id_number.substr(6, 1));
    string gender = gender_digit >= 5 ? "Male" : "Female";
    
    // Citizenship
    int citizenship_digit = stoi(id_number.substr(10, 1));
    string citizenship = citizenship_digit == 0 ? "SA Citizen" : "Permanent Resident";
    
    // Validity (basic check)
    bool valid = true;
    
    cout << "Date of Birth: " << dob_str << endl;
    cout << "Age: " << age << endl;
    cout << "Gender: " << gender << endl;
    cout << "Citizenship: " << citizenship << endl;
    cout << "ID Number Validity: " << (valid ? "Valid" : "Invalid") << endl;
}

int main() {
    string id_number;
    
    cout << "Enter South African ID number: ";
    getline(cin, id_number);
    id_number_info(id_number);
    cout << "Thank you for using our service." << endl;
    
    while (true) {
        cout << "Would you like to check another ID number? (yes/no): ";
        getline(cin, id_number);
        
        // Convert to lowercase and trim whitespace (equivalent to strip().lower())
        string trimmed = id_number;
        
        // Trim leading and trailing whitespace
        size_t start = trimmed.find_first_not_of(" \t\n\r");
        size_t end = trimmed.find_last_not_of(" \t\n\r");
        trimmed = (start != string::npos) ? trimmed.substr(start, end - start + 1) : "";
        
        // Convert to lowercase
        transform(trimmed.begin(), trimmed.end(), trimmed.begin(), ::tolower);
        
        if (trimmed == "yes" || trimmed == "y") {
            cout << "Enter South African ID number: ";
            getline(cin, id_number);
            id_number_info(id_number);
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
