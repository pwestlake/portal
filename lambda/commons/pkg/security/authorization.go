package security

import (
	"strings"
	"github.com/aws/aws-lambda-go/events"
)

type authorizationError struct {
	message string
}

func (s *authorizationError) Error() string {
	return s.message
}

// RequireGroup ...
// Returns an error if the claims of the given request do not specify the
// given group
func RequireGroup(group string, request events.APIGatewayProxyRequest) error {
	claims, ok  := request.RequestContext.Authorizer["claims"].(map[string]interface{})
	if !ok {
		return &authorizationError{message: "Not authorized"}
	}

	groups, ok := claims["cognito:groups"].(string)
	if !ok || !strings.Contains(groups, "covid19") {
		return &authorizationError{message: "Not authorized"}
	}
	
	// Authorized
	return nil
}