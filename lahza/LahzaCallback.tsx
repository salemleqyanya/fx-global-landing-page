import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import paymentService from '@/services/paymentService';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type StatusState = 'pending' | 'success' | 'error';

const LahzaCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusState>('pending');
  const [message, setMessage] = useState('Verifying your payment...');
  const [reference, setReference] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  useEffect(() => {
    // Extract reference from URL query parameters
    // According to Lahza docs: https://docs.lahza.io/payments/accept-payments#handle-the-callback-method
    // The callback URL will have the reference as a query parameter
    const params = new URLSearchParams(location.search);
    const ref = params.get('reference') || params.get('ref');
    setReference(ref);

    if (!ref) {
      setStatus('error');
      setMessage('Missing payment reference in callback URL. Please contact support if you completed the payment.');
      return;
    }

    const verifyPayment = async () => {
      try {
        console.log('[LahzaCallback] Verifying payment with reference:', ref);
        
        // Call backend to verify the transaction
        // The backend will call Lahza's verify endpoint and activate the subscription
        const response = await paymentService.verifyLahzaTransaction(ref);
        
        console.log('[LahzaCallback] Verification response:', response);
        
        if (response.success) {
          setStatus('success');
          setTransactionDetails(response);
          
          // Show success message
          const successMessage = response.message || 'Payment verified successfully! Your subscription has been activated.';
          setMessage(successMessage);
          
          // Clear pending payment from localStorage
          localStorage.removeItem('pending_lahza_payment');
          
          // Force refresh user's plan data by invalidating all related queries
          await queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
          await queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
          await queryClient.invalidateQueries({ queryKey: ['plans'] });
          
          // Refetch current plan immediately to ensure UI updates
          await queryClient.refetchQueries({ queryKey: ['currentPlan'] });
          await queryClient.refetchQueries({ queryKey: ['userSubscriptions'] });
          
          toast({
            title: 'Payment Successful!',
            description: successMessage + (response.subscription_id ? ` Subscription ID: ${response.subscription_id}` : ''),
          });

          // Redirect to plans page after 2 seconds
          setTimeout(() => {
            navigate('/plans', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          const errorMessage = response.error || response.message || 'Payment could not be verified. Please contact support.';
          setMessage(errorMessage);
          
          toast({
            title: 'Payment Verification Failed',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('[LahzaCallback] Verification error:', error);
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Unable to verify payment. Please contact support.';
        setMessage(errorMessage);
        
        toast({
          title: 'Verification Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    };

    verifyPayment();
  }, [location.search, navigate, queryClient, toast]);

  const renderIcon = () => {
    if (status === 'pending') {
      return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
    }
    if (status === 'success') {
      return <CheckCircle2 className="h-12 w-12 text-green-500" />;
    }
    return <XCircle className="h-12 w-12 text-red-500" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <Card className="w-full max-w-md text-center shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Lahza Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 py-6">
            {renderIcon()}
            <p className="text-sm text-muted-foreground">{message}</p>
            {reference && (
              <p className="text-xs text-muted-foreground">
                Reference: <span className="font-mono">{reference}</span>
              </p>
            )}
            {status === 'success' && transactionDetails && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 w-full text-left">
                <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-2">Transaction Details:</p>
                {transactionDetails.transaction_id && (
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Transaction ID: <span className="font-mono">{transactionDetails.transaction_id}</span>
                  </p>
                )}
                {transactionDetails.subscription_id && (
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Subscription activated successfully!
                  </p>
                )}
              </div>
            )}
          </div>

          {status !== 'pending' && (
            <Button
              className="w-full"
              onClick={() => navigate('/plans', { replace: true })}
            >
              Back to Plans
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LahzaCallback;


