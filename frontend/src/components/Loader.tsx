import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function Loader({ message = "Loading...", showAlert = false }) {
    return (
        <div className="flex flex-col items-center justify-center w-full gap-4 pt-6 pb-6">
            {showAlert && (
                <Alert className="max-w-md mb-4">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <AlertTitle>Please wait</AlertTitle>
                    <AlertDescription>
                        {message}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col items-center justify-center">
                <div className="relative">
                    {/* Outer spinner */}
                    <div className="w-12 h-12 rounded-full border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 animate-spin"></div>

                    {/* Inner spinner */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin animate-pulse" />
                    </div>
                </div>

                <span className="sr-only">Loading</span>
                <p className="text-sm text-gray-500 mt-2">{message}</p>
            </div>
        </div>
    );
}

export default Loader;