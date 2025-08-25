from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import create_application, get_applications, login_view, signup_view, login_client, approve_application, user_view
from .views import admin_login, add_client, submit_to_person2, get_submitted_applications, client2_approve_application
from .views import get_application_by_id, check_pending_application, disapprove_application, get_done_application, get_notifications
from .views import client2_approved, get_submitted, GetUsers, get_application_detail, get_user_id, reject_application, update_application, get_form_by_id
from .views import vapid_public_key, save_information, test_send_email, current_user_view, get_user_subscription_status, create_renewal, approve_renewal, save_signature
from .views import update_renewal_picture, client2_approve_renewal, all_applications_view, delete_user_view, manage_users, submit_report, check_username, send_verification_code, verify_code
from .views import reset_password, respond_report, update_user_view
urlpatterns = [
    path('login/', login_view, name='login'),
    path('signup/', signup_view, name='signup'),
    path('loginClient/', login_client, name='loginClient'),
    path('users/', user_view, name='user_list'),
    path('admin/login/', admin_login, name='admin_login'),
    path('add-client/', add_client, name='add-client'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('current-user/', current_user_view, name='current-user'),
    
    # Application-related paths
    
    path('get-application-id/', get_user_id, name='get_user_id'),
    path('application/', create_application, name='create_application'),
    path('application/<int:pk>/', update_application, name='update_application'),
    path('applications/', get_applications, name='get_applications'),  # For fetching all applications (GET request)
    path('applications/<int:id>/', get_application_detail, name='application-detail'),
    path('application/<int:application_id>/',get_application_by_id, name='get_application_by_id'),
    path('application/<int:pk>/approve/', approve_application, name='approve_application'),
    path('application/<int:pk>/disapprove/', disapprove_application, name='disapprove_application'),
    path('application/get_submitted/<int:pk>/client2_approve/', client2_approve_application, name='client2_approve_application'),
    path('application/get_submitted/', get_submitted, name='get_submitted'),
    path('application/submit_to_person2/<int:application_id>/', submit_to_person2, name='submit_to_person2'),
    path('application/submitted/', get_submitted_applications, name='get_submitted_applications'),
    path('application/pending/', check_pending_application, name='check_pending_application'),
    path('application/client2_approved/', client2_approved, name='client2_approved'),
    path('application/get_done_application/<int:application_id>/', get_done_application, name='get_done_application'),
    path('get-users/', GetUsers.as_view(), name='get_users'),
    path('applications/<int:application_id>/reject/', reject_application, name='reject-application'),
    path('notifications/', get_notifications, name='get_notifications'),
    path('webpush/vapid_public_key', vapid_public_key, name='vapid_public_key'),
    path('webpush/save_information/', save_information, name='save_information'),
    path('test-send-email/', test_send_email, name='test-send-email'),
    path('get-user-subscription-status/', get_user_subscription_status, name='get_user_subscription_status'),
    path('renewal/', create_renewal, name='create_renewal'),
    path('renewal/<int:pk>/approve/', approve_renewal, name='approve-renewal'),
    path('renewal/<int:pk>/client2_approve/', client2_approve_renewal, name='client2_approve_renewal'),
    path('save-signature/', save_signature, name='save_signature'),
    path('form-view/<int:id>/', get_form_by_id, name='get_form_by_id'),
    path('renewal/<int:pk>/update_picture/', update_renewal_picture, name='update_renewal_picture'),
    path('all-applications/', all_applications_view, name='all-applications'),
    path('users/<int:user_id>/delete/', delete_user_view, name='delete-user'),
    path('manage-users/', manage_users, name='manage_users'),
    path('submit-report/',submit_report, name='submit_report'),
    path('check-username/<str:username>/', check_username, name='check_username'),
    path('send-code/<str:username>/', send_verification_code, name='send_verification_code'),
    path("verify_code/", verify_code, name="verify_code"),
    path("reset_password/", reset_password, name="reset_password"),
    path('respond-report/<int:report_id>/', respond_report, name='respond_report'),
    path("update-user/", update_user_view, name="update-user"),

]






