#!/usr/bin/env python3
"""
Backend API Testing for Taqdeer Exam System
Tests all endpoints with admin and student credentials
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class TaqdeerAPITester:
    def __init__(self, base_url="https://taqdeer-school.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_exam_id = None
        self.created_question_id = None
        self.student_exam_id = None

    def log(self, message: str, success: bool = True):
        """Log test results"""
        symbol = "✅" if success else "❌"
        print(f"{symbol} {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, token: Optional[str] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"Status: {response.status_code}")
            else:
                self.log(f"Expected {expected_status}, got {response.status_code}", False)
                if response.text:
                    print(f"   Response: {response.text[:200]}")

            try:
                response_data = response.json() if response.text else {}
            except:
                response_data = {}

            return success, response_data

        except Exception as e:
            self.log(f"Error: {str(e)}", False)
            return False, {}

    def test_init_accounts(self):
        """Initialize admin and student accounts"""
        print("\n" + "="*50)
        print("🚀 INITIALIZING ACCOUNTS")
        print("="*50)
        
        # Initialize admin
        success, _ = self.run_test(
            "Initialize Admin Account",
            "POST",
            "init-admin",
            200
        )
        
        # Initialize student
        success, _ = self.run_test(
            "Initialize Student Account", 
            "POST",
            "init-student-account",
            200
        )

    def test_authentication(self):
        """Test login functionality"""
        print("\n" + "="*50)
        print("🔐 AUTHENTICATION TESTS")
        print("="*50)
        
        # Test admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log(f"Admin token obtained: {self.admin_token[:20]}...")
        
        # Test student login
        success, response = self.run_test(
            "Student Login",
            "POST", 
            "auth/login",
            200,
            data={"username": "student", "password": "student123"}
        )
        if success and 'access_token' in response:
            self.student_token = response['access_token']
            self.log(f"Student token obtained: {self.student_token[:20]}...")
        
        # Test invalid login
        success, _ = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login", 
            401,
            data={"username": "invalid", "password": "wrong"}
        )

        # Test get current user
        if self.admin_token:
            success, response = self.run_test(
                "Get Admin Profile",
                "GET",
                "auth/me",
                200,
                token=self.admin_token
            )

    def test_exam_management(self):
        """Test exam CRUD operations"""
        print("\n" + "="*50)
        print("📝 EXAM MANAGEMENT TESTS")
        print("="*50)
        
        if not self.admin_token:
            self.log("No admin token available", False)
            return

        # Create exam
        exam_data = {
            "title": "اختبار تجريبي - القدرات العامة",
            "description": "اختبار تجريبي لقياس القدرات العامة للطلاب",
            "instructions": "اقرأ كل سؤال بعناية واختر الإجابة الصحيحة. لا يمكن العودة للأسئلة السابقة.",
            "sections": [
                {"section_number": 1, "title": "القسم الأول - كمي", "duration_minutes": 25},
                {"section_number": 2, "title": "القسم الثاني - لفظي", "duration_minutes": 25},
                {"section_number": 3, "title": "القسم الثالث - كمي", "duration_minutes": 25},
                {"section_number": 4, "title": "القسم الرابع - لفظي", "duration_minutes": 25},
                {"section_number": 5, "title": "القسم الخامس - مختلط", "duration_minutes": 25}
            ]
        }
        
        success, response = self.run_test(
            "Create Exam",
            "POST",
            "exams",
            200,
            data=exam_data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.created_exam_id = response['id']
            self.log(f"Created exam ID: {self.created_exam_id}")

        # Get all exams
        success, response = self.run_test(
            "Get All Exams",
            "GET", 
            "exams",
            200,
            token=self.admin_token
        )

        # Get specific exam
        if self.created_exam_id:
            success, _ = self.run_test(
                "Get Specific Exam",
                "GET",
                f"exams/{self.created_exam_id}",
                200,
                token=self.admin_token
            )

        # Update exam
        if self.created_exam_id:
            update_data = {
                "title": "اختبار تجريبي محدث - القدرات العامة",
                "description": "اختبار تجريبي محدث لقياس القدرات العامة",
                "instructions": "تعليمات محدثة للاختبار"
            }
            success, _ = self.run_test(
                "Update Exam",
                "PUT",
                f"exams/{self.created_exam_id}",
                200,
                data=update_data,
                token=self.admin_token
            )

    def test_question_management(self):
        """Test question CRUD operations"""
        print("\n" + "="*50)
        print("❓ QUESTION MANAGEMENT TESTS")
        print("="*50)
        
        if not self.admin_token or not self.created_exam_id:
            self.log("No admin token or exam ID available", False)
            return

        # Create question
        question_data = {
            "text": "ما هو ناتج 15 + 25؟",
            "exam_id": self.created_exam_id,
            "section_number": 1,
            "points": 1,
            "options": [
                {"id": "opt1", "text": "30", "is_correct": False},
                {"id": "opt2", "text": "35", "is_correct": False}, 
                {"id": "opt3", "text": "40", "is_correct": True},
                {"id": "opt4", "text": "45", "is_correct": False}
            ]
        }
        
        success, response = self.run_test(
            "Create Question",
            "POST",
            "questions",
            200,
            data=question_data,
            token=self.admin_token
        )
        if success and 'id' in response:
            self.created_question_id = response['id']
            self.log(f"Created question ID: {self.created_question_id}")

        # Create more questions for different sections
        for section in range(2, 6):
            question_data = {
                "text": f"سؤال تجريبي للقسم {section}",
                "exam_id": self.created_exam_id,
                "section_number": section,
                "points": 1,
                "options": [
                    {"id": f"opt1_s{section}", "text": "الخيار الأول", "is_correct": True},
                    {"id": f"opt2_s{section}", "text": "الخيار الثاني", "is_correct": False},
                    {"id": f"opt3_s{section}", "text": "الخيار الثالث", "is_correct": False},
                    {"id": f"opt4_s{section}", "text": "الخيار الرابع", "is_correct": False}
                ]
            }
            
            success, _ = self.run_test(
                f"Create Question Section {section}",
                "POST",
                "questions",
                200,
                data=question_data,
                token=self.admin_token
            )

        # Get questions
        success, _ = self.run_test(
            "Get All Questions",
            "GET",
            "questions",
            200,
            token=self.admin_token
        )

        # Get questions by exam
        success, _ = self.run_test(
            "Get Questions by Exam",
            "GET",
            f"questions?exam_id={self.created_exam_id}",
            200,
            token=self.admin_token
        )

        # Get questions by section
        success, _ = self.run_test(
            "Get Questions by Section",
            "GET",
            f"questions?exam_id={self.created_exam_id}&section=1",
            200,
            token=self.admin_token
        )

    def test_exam_publishing(self):
        """Test exam publishing workflow"""
        print("\n" + "="*50)
        print("📢 EXAM PUBLISHING TESTS")
        print("="*50)
        
        if not self.admin_token or not self.created_exam_id:
            self.log("No admin token or exam ID available", False)
            return

        # Publish exam
        success, _ = self.run_test(
            "Publish Exam",
            "POST",
            f"exams/{self.created_exam_id}/publish",
            200,
            token=self.admin_token
        )

        # Verify exam is published (student should see it)
        if self.student_token:
            success, response = self.run_test(
                "Student Get Published Exams",
                "GET",
                "exams",
                200,
                token=self.student_token
            )
            if success:
                published_exams = [e for e in response if e.get('status') == 'published']
                self.log(f"Student can see {len(published_exams)} published exam(s)")

    def test_student_exam_flow(self):
        """Test complete student exam flow"""
        print("\n" + "="*50)
        print("🎓 STUDENT EXAM FLOW TESTS")
        print("="*50)
        
        if not self.student_token or not self.created_exam_id:
            self.log("No student token or exam ID available", False)
            return

        # Start exam
        start_data = {
            "exam_id": self.created_exam_id,
            "student_name": "طالب تجريبي",
            "student_phone": "0501234567"
        }
        
        success, response = self.run_test(
            "Start Student Exam",
            "POST",
            "student-exams/start",
            200,
            data=start_data,
            token=self.student_token
        )
        if success and 'id' in response:
            self.student_exam_id = response['id']
            self.log(f"Started student exam ID: {self.student_exam_id}")

        # Get student exam details
        if self.student_exam_id:
            success, _ = self.run_test(
                "Get Student Exam Details",
                "GET",
                f"student-exams/{self.student_exam_id}",
                200,
                token=self.student_token
            )

        # Submit answer
        if self.student_exam_id and self.created_question_id:
            answer_data = {
                "student_exam_id": self.student_exam_id,
                "question_id": self.created_question_id,
                "selected_option_id": "opt3"  # Correct answer
            }
            
            success, _ = self.run_test(
                "Submit Answer",
                "POST",
                "student-exams/answer",
                200,
                data=answer_data,
                token=self.student_token
            )

        # Move to next section
        if self.student_exam_id:
            success, _ = self.run_test(
                "Move to Next Section",
                "POST",
                f"student-exams/{self.student_exam_id}/next-section",
                200,
                token=self.student_token
            )

    def test_grading_system(self):
        """Test grading functionality"""
        print("\n" + "="*50)
        print("📊 GRADING SYSTEM TESTS")
        print("="*50)
        
        if not self.admin_token or not self.student_exam_id:
            self.log("No admin token or student exam ID available", False)
            return

        # Calculate automatic grade
        success, response = self.run_test(
            "Calculate Automatic Grade",
            "POST",
            f"grades/calculate/{self.student_exam_id}",
            200,
            token=self.admin_token
        )
        if success:
            self.log(f"Calculated score: {response.get('score', 'N/A')}%")

        # Assign manual grade
        grade_data = {
            "student_exam_id": self.student_exam_id,
            "score": 85.5,
            "release_grade": True
        }
        
        success, _ = self.run_test(
            "Assign Manual Grade",
            "POST",
            "grades/assign",
            200,
            data=grade_data,
            token=self.admin_token
        )

        # Release grade
        success, _ = self.run_test(
            "Release Grade",
            "POST",
            f"grades/release/{self.student_exam_id}",
            200,
            token=self.admin_token
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n" + "="*50)
        print("📈 DASHBOARD STATS TESTS")
        print("="*50)
        
        if not self.admin_token:
            self.log("No admin token available", False)
            return

        # Get dashboard stats
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200,
            token=self.admin_token
        )
        if success:
            stats = response
            self.log(f"Total exams: {stats.get('total_exams', 0)}")
            self.log(f"Published exams: {stats.get('published_exams', 0)}")
            self.log(f"Total questions: {stats.get('total_questions', 0)}")
            self.log(f"Total students: {stats.get('total_students', 0)}")

        # Get exam progress
        if self.created_exam_id:
            success, response = self.run_test(
                "Get Exam Progress",
                "GET",
                f"dashboard/exam-progress/{self.created_exam_id}",
                200,
                token=self.admin_token
            )

    def test_student_results(self):
        """Test student results retrieval"""
        print("\n" + "="*50)
        print("🏆 STUDENT RESULTS TESTS")
        print("="*50)
        
        if not self.student_token:
            self.log("No student token available", False)
            return

        # Get student's own results
        success, response = self.run_test(
            "Get Student Results",
            "GET",
            "student-exams/my/results",
            200,
            token=self.student_token
        )
        if success:
            self.log(f"Student has {len(response)} released results")

        # Get student's exam history
        success, response = self.run_test(
            "Get Student Exam History",
            "GET",
            "student-exams",
            200,
            token=self.student_token
        )

    def run_all_tests(self):
        """Run all test suites"""
        print("🎯 TAQDEER EXAM SYSTEM - BACKEND API TESTING")
        print("=" * 60)
        
        try:
            self.test_init_accounts()
            self.test_authentication()
            self.test_exam_management()
            self.test_question_management()
            self.test_exam_publishing()
            self.test_student_exam_flow()
            self.test_grading_system()
            self.test_dashboard_stats()
            self.test_student_results()
            
        except Exception as e:
            self.log(f"Critical error during testing: {str(e)}", False)

        # Print final results
        print("\n" + "="*60)
        print("📊 FINAL RESULTS")
        print("="*60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("⚠️  SOME TESTS FAILED")
            return 1

def main():
    tester = TaqdeerAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())