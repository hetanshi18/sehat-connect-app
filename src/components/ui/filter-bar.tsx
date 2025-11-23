import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSpecialty: string;
  onSpecialtyChange: (value: string) => void;
  selectedRating: string;
  onRatingChange: (value: string) => void;
  selectedAvailability: string;
  onAvailabilityChange: (value: string) => void;
  specialties: string[];
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedSpecialty,
  onSpecialtyChange,
  selectedRating,
  onRatingChange,
  selectedAvailability,
  onAvailabilityChange,
  specialties,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 mb-8 animate-[slide-down_0.5s_ease-out,fade-in_0.5s_ease-out]">
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-soft p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search doctors…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Specialization Dropdown */}
          <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
            <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
              <SelectValue placeholder="All Specializations" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border/50 rounded-2xl shadow-medium">
              <SelectItem value="all">All Specializations</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rating Filter */}
          <Select value={selectedRating} onValueChange={onRatingChange}>
            <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border/50 rounded-2xl shadow-medium">
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
              <SelectItem value="4.0">4.0+ Stars</SelectItem>
              <SelectItem value="3.5">3.5+ Stars</SelectItem>
            </SelectContent>
          </Select>

          {/* Availability Filter */}
          <Select value={selectedAvailability} onValueChange={onAvailabilityChange}>
            <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
              <SelectValue placeholder="All Availability" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border/50 rounded-2xl shadow-medium">
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="today">Available Today</SelectItem>
              <SelectItem value="week">Available This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
