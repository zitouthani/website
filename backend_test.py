import requests
import sys
import os
import base64
from datetime import datetime
import json

class ProfessionalPhotoAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_keys = ["status", "service"]
                has_required_keys = all(key in data for key in expected_keys)
                if has_required_keys and data.get("status") == "healthy":
                    self.log_test("Health Check", True)
                    return True
                else:
                    self.log_test("Health Check", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if "message" in data and "status" in data:
                    self.log_test("Root Endpoint", True)
                    return True
                else:
                    self.log_test("Root Endpoint", False, f"Invalid response: {data}")
                    return False
            else:
                self.log_test("Root Endpoint", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False

    def create_test_image(self):
        """Create a simple test image in base64 format"""
        # Create a minimal PNG image (1x1 pixel red dot)
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        )
        return png_data

    def test_generate_professional_photo(self):
        """Test professional photo generation endpoint"""
        try:
            # Create test image
            test_image_data = self.create_test_image()
            
            # Prepare multipart form data
            files = {
                'file': ('test_image.png', test_image_data, 'image/png')
            }
            
            print("🔄 Starting photo generation (this may take 60-90 seconds)...")
            
            # Make request with extended timeout for AI generation
            response = requests.post(
                f"{self.base_url}/api/generate-professional-photo",
                files=files,
                timeout=150  # 2.5 minutes timeout for AI generation
            )
            
            if response.status_code == 200:
                data = response.json()
                required_keys = ["success", "photo_id", "professional_image", "message"]
                
                if all(key in data for key in required_keys):
                    if data.get("success") and data.get("professional_image"):
                        # Verify the professional_image is valid base64
                        try:
                            base64.b64decode(data["professional_image"])
                            self.log_test("Generate Professional Photo", True)
                            return data["photo_id"]
                        except Exception:
                            self.log_test("Generate Professional Photo", False, "Invalid base64 image data")
                            return None
                    else:
                        self.log_test("Generate Professional Photo", False, f"Success=False or missing image: {data}")
                        return None
                else:
                    self.log_test("Generate Professional Photo", False, f"Missing required keys: {data}")
                    return None
            else:
                error_detail = ""
                try:
                    error_data = response.json()
                    error_detail = error_data.get("detail", "Unknown error")
                except:
                    error_detail = response.text
                
                self.log_test("Generate Professional Photo", False, f"Status {response.status_code}: {error_detail}")
                return None
                
        except requests.exceptions.Timeout:
            self.log_test("Generate Professional Photo", False, "Request timeout (>150s)")
            return None
        except Exception as e:
            self.log_test("Generate Professional Photo", False, f"Exception: {str(e)}")
            return None

    def test_get_photo(self, photo_id):
        """Test retrieving a specific photo by ID"""
        if not photo_id:
            self.log_test("Get Photo by ID", False, "No photo_id provided")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/api/photos/{photo_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_keys = ["success", "photo_id", "original_image", "professional_image", "created_at"]
                
                if all(key in data for key in required_keys):
                    self.log_test("Get Photo by ID", True)
                    return True
                else:
                    self.log_test("Get Photo by ID", False, f"Missing required keys: {data}")
                    return False
            else:
                self.log_test("Get Photo by ID", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Photo by ID", False, f"Exception: {str(e)}")
            return False

    def test_list_photos(self):
        """Test listing photos endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/photos", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_keys = ["success", "count", "photos"]
                
                if all(key in data for key in required_keys):
                    if isinstance(data["photos"], list):
                        self.log_test("List Photos", True)
                        return True
                    else:
                        self.log_test("List Photos", False, "Photos is not a list")
                        return False
                else:
                    self.log_test("List Photos", False, f"Missing required keys: {data}")
                    return False
            else:
                self.log_test("List Photos", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("List Photos", False, f"Exception: {str(e)}")
            return False

    def test_invalid_file_upload(self):
        """Test uploading invalid file type"""
        try:
            # Create a text file instead of image
            files = {
                'file': ('test.txt', b'This is not an image', 'text/plain')
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate-professional-photo",
                files=files,
                timeout=30
            )
            
            # Should return 400 for invalid file type
            if response.status_code == 400:
                self.log_test("Invalid File Type Handling", True)
                return True
            else:
                self.log_test("Invalid File Type Handling", False, f"Expected 400, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invalid File Type Handling", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Professional Photo API Tests")
        print("=" * 50)
        
        # Basic connectivity tests
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
            
        self.test_root_endpoint()
        
        # Core functionality tests
        photo_id = self.test_generate_professional_photo()
        
        if photo_id:
            self.test_get_photo(photo_id)
        
        self.test_list_photos()
        
        # Error handling tests
        self.test_invalid_file_upload()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    """Main test function"""
    # Use the public endpoint from environment
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    
    tester = ProfessionalPhotoAPITester(backend_url)
    success = tester.run_all_tests()
    
    # Save test results
    results = {
        "timestamp": datetime.utcnow().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())