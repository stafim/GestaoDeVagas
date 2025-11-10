import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface JobStatusSelectProps {
  jobId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

type JobStatus = {
  id: string;
  key: string;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color?: string;
  displayOrder: number;
  isActive: boolean;
};

export default function JobStatusSelect({ jobId, currentStatus, onStatusChange }: JobStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobStatuses = [] } = useQuery<JobStatus[]>({
    queryKey: ["/api/job-statuses"],
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Find status by ID first, fallback to key for backward compatibility
  const currentStatusData = jobStatuses.find(s => s.id === currentStatus || s.key === currentStatus);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest("PATCH", `/api/jobs/${jobId}/status`, { status: newStatus });
    },
    onSuccess: (_, newStatus) => {
      const newStatusData = jobStatuses.find(s => s.id === newStatus || s.key === newStatus);
      toast({
        title: "Status atualizado",
        description: `Status da vaga alterado para ${newStatusData?.label || newStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/jobs-by-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      setIsEditing(false);
      onStatusChange?.(newStatus);
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status da vaga",
        variant: "destructive",
      });
      setSelectedStatus(currentStatus);
    }
  });

  const handleSave = () => {
    if (selectedStatus !== currentStatus) {
      updateStatusMutation.mutate(selectedStatus);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setIsEditing(false);
  };

  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "default":
        return "bg-primary text-primary-foreground border-primary";
      case "secondary":
        return "bg-secondary text-secondary-foreground border-secondary";
      case "destructive":
        return "bg-destructive text-destructive-foreground border-destructive";
      case "outline":
        return "bg-background text-foreground border-border";
      default:
        return "bg-primary text-primary-foreground border-primary";
    }
  };

  if (!isEditing) {
    return (
      <div 
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-testid={`status-badge-${jobId}`}
      >
        <div 
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            !currentStatusData?.color ? getVariantClasses(currentStatusData?.variant || "default") : ""
          }`}
          style={currentStatusData?.color ? {
            backgroundColor: currentStatusData.color,
            color: '#ffffff',
            borderColor: currentStatusData.color
          } : undefined}
        >
          {currentStatusData?.label || currentStatus}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={selectedStatus} 
        onValueChange={setSelectedStatus}
        data-testid={`status-select-${jobId}`}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {jobStatuses
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((status) => (
              <SelectItem 
                key={status.id} 
                value={status.id} 
                data-testid={`status-option-${status.key}`}
              >
                {status.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSave}
        disabled={updateStatusMutation.isPending}
        data-testid={`button-save-status-${jobId}`}
      >
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCancel}
        disabled={updateStatusMutation.isPending}
        data-testid={`button-cancel-status-${jobId}`}
      >
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}
