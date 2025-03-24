import React, { useState, useEffect } from 'react';
import CsvDownloader from 'react-json-to-csv';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Checkbox } from "../ui/checkbox"
import { CalendarIcon, Filter, Search, X } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Calendar } from "../ui/calendar";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Slider
} from "../ui/slider"
import { Switch } from "../ui/switch";
import { useNavigation } from "@remix-run/react";

interface Order {
  id: string;
  orderId: string;
  orderDate: string;
  name: string;
  email: string;
  phone: string | null;
  productId: string;
  productName: string;
  payment: string;
  paymentMethod: string;
  paymentValue: number;
  tier: string;
  address: string;
  customerId: string | null;
  riskVerification: string;
  tags: string | null;
  otp: string;
  ivr: string;
  shipmentStatus: string;
  qualityScore: number;
  tierCity: string | null;
  deliveryTime: string | null;
  flagged: boolean;
  shippable: boolean;
  cancelledAt: string | null; // Add this line
  closed: boolean;           // Add this line
}

interface OrdersTableProps {
  orders: Order[]; // Add this line
  threshold: number;
  filters: {
    dateRange: { from: Date | undefined; to: Date | undefined };
    datePreset: string;
    onlyBelowThreshold: boolean;
    onlyAboveThreshold: boolean;
    orderStatus: string[];
    tierCity: string[];
    deliveryTime: string[];
    verificationStatus: string[];
    tags: string[];
    scoreRange: [number, number];
    searchQuery: string;
  };
  selectedOrders: string[];
  onSelectOrders: (orders: string[]) => void;
  onCancelOrder: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, // Add this
  threshold, 
  filters, 
  selectedOrders, 
  onSelectOrders,
  onCancelOrder 
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<Order[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<string>("today");
  const [showFlagged, setShowFlagged] = useState(false);
  const [showShippable, setShowShippable] = useState(false);
  const [pageSize, setPageSize] = useState(100);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [riskVerificationFilter, setRiskVerificationFilter] = useState<string>('all');
  const [selectedTierCity, setSelectedTierCity] = useState<string[]>([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (orders) {
      setData(orders);
    }
  }, [orders]);
  
  useEffect(() => {
    if (selectAll) {
      onSelectOrders(data.map(order => order.id));
    } else {
      onSelectOrders([]);
    }
  }, [selectAll, data, onSelectOrders]);

  // Handle date preset changes
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    switch (datePreset) {
      case 'today':
        setDateRange({ from: today, to: today });
        break;
      case 'yesterday':
        setDateRange({ from: yesterday, to: yesterday });
        break;
      case 'last7days':
        setDateRange({ from: lastWeekStart, to: today });
        break;
      case 'custom':
        // Keep the current custom range
        break;
      default:
        setDateRange({ from: undefined, to: undefined });
    }
  }, [datePreset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedSearchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [debouncedSearchQuery]);
  
  const navigation = useNavigation();

  const handleCancelOrder = (orderId: string) => {
    onCancelOrder(orderId);
  };

  // Update the actions column definition
  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            setSelectAll(!!value);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            const orderId = row.original.orderId; // Changed from id to orderId
            if (value) {
              onSelectOrders([...selectedOrders, orderId]);
            } else {
              onSelectOrders(selectedOrders.filter(id => id !== orderId));
            }
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "orderId",
      header: "Order ID"
    },
    {
      accessorKey: "name",
      header: "Customer Name"
    },
    {
      accessorKey: "orderDate",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("orderDate")), "dd MMM yyyy")
    },
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.getValue("productName")}</span>
          <span className="text-xs text-muted-foreground">{row.original.productId}</span>
        </div>
      )
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Type"
    },
    {
      accessorKey: "paymentValue",
      header: "Payment Value",
      cell: ({ row }) => {
        const amount = row.getValue("paymentValue") as number;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      }
    },
    {
      accessorKey: "tierCity",
      header: "Tier City"
    },
    {
      accessorKey: "qualityScore",
      header: "Score",
      cell: ({ row }) => {
        const score = row.getValue("qualityScore") as number;
        const badgeColor = score < threshold ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
        return <Badge className={badgeColor}>{score}</Badge>;
      }
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = (row.getValue("tags") as string || "").split(",").filter(Boolean);
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary">{tag}</Badge>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "deliveryTime",
      header: "Delivery Time"
    },
    {
      accessorKey: "shipmentStatus",
      header: "Shipment Status",
      cell: ({ row }) => {
        const status = row.getValue("shipmentStatus") as string;
        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
        
        switch(status) {
          case "DELIVERED":
            badgeVariant = "default";
            break;
          case "IN_TRANSIT":
          case "OUT_FOR_DELIVERY":
            badgeVariant = "secondary";
            break;
          case "CANCELLED":
          case "FAILED":
            badgeVariant = "destructive";
            break;
          default:
            badgeVariant = "outline";
        }
        
        return <Badge variant={badgeVariant}>{status}</Badge>;
      }
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const order = row.original;
        const isLoading = navigation.state === "submitting" && 
                         navigation.formData?.get("orderId") === order.orderId;

        return (
          <div className="flex justify-end">
            <Button 
              variant="destructive" 
              size="sm" 
              disabled={order.cancelledAt !== null || order.closed || isLoading}
              className="h-8 px-3 flex items-center gap-1"
              onClick={() => onCancelOrder(order.orderId)}
            >
              {isLoading ? (
                <span>Cancelling...</span>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </>
              )}
            </Button>
          </div>
        );
      },
    },
  ]

  // Filter data based on flagged and shippable status
  const filteredData = React.useMemo(() => {
    let filtered = [...data];
    
    // Apply date filter
    if (dateRange.from) {
      const startOfDay = new Date(dateRange.from);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      endOfDay.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
    }

    // Apply tier city filter
    if (selectedTierCity.length > 0) {
      filtered = filtered.filter(order => 
        selectedTierCity.includes(order.tierCity || '')
      );
    }

    // Apply delivery time filter
    if (selectedDeliveryTime.length > 0) {
      filtered = filtered.filter(order => 
        selectedDeliveryTime.includes(order.deliveryTime || '')
      );
    }

    // Apply tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(order => {
        const orderTags = order.tags?.split(',').map(tag => tag.trim()) || [];
        return selectedTags.some(tag => orderTags.includes(tag));
      });
    }

    // Rest of existing filters
    if (showFlagged) {
      filtered = filtered.filter(order => order.flagged);
    }
    
    if (showShippable) {
      filtered = filtered.filter(order => order.shippable);
    }
    
    // Apply score range filter
    filtered = filtered.filter(order => 
      order.qualityScore >= scoreRange[0] && order.qualityScore <= scoreRange[1]
    );
    
    // Apply shipment status filter
    if (shipmentStatusFilter !== 'all') {
      filtered = filtered.filter(order => order.shipmentStatus === shipmentStatusFilter);
    }

    // Apply payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === paymentMethodFilter);
    }

    // Apply risk verification filter
    if (riskVerificationFilter !== 'all') {
      filtered = filtered.filter(order => order.riskVerification === riskVerificationFilter);
    }
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        // Check multiple fields for the search query
        return (
          order.orderId?.toLowerCase().includes(lowercaseQuery) ||
          order.name?.toLowerCase().includes(lowercaseQuery) ||
          order.email?.toLowerCase().includes(lowercaseQuery) ||
          order.phone?.toLowerCase().includes(lowercaseQuery) ||
          order.productName?.toLowerCase().includes(lowercaseQuery) ||
          order.productId?.toLowerCase().includes(lowercaseQuery) ||
          order.address?.toLowerCase().includes(lowercaseQuery) ||
          order.customerId?.toLowerCase().includes(lowercaseQuery) ||
          order.shipmentStatus?.toLowerCase().includes(lowercaseQuery) ||
          order.tierCity?.toLowerCase().includes(lowercaseQuery) ||
          (order.tags && order.tags.toLowerCase().includes(lowercaseQuery)) ||
          order.paymentMethod?.toLowerCase().includes(lowercaseQuery)
        );
      });
    }
    
    return filtered;
  }, [data, showFlagged, showShippable, searchQuery, shipmentStatusFilter, 
      paymentMethodFilter, riskVerificationFilter, scoreRange, dateRange,
      selectedTierCity, selectedDeliveryTime, selectedTags]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
  })

  // Handle slider value change with the correct typing
  const handleScoreRangeChange = (values: number[]) => {
    // Ensure we're setting a tuple of exactly two numbers
    setScoreRange([values[0], values[1]] as [number, number]);
  };

  // Helper function to toggle array items
  const toggleArrayItem = (array: string[], item: string): string[] => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={debouncedSearchQuery}
                onChange={(e) => setDebouncedSearchQuery(e.target.value)}
                className="pl-8"
              />
              {debouncedSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => {
                    setDebouncedSearchQuery('');
                    setSearchQuery('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {datePreset !== 'custom' ? (
                      datePreset === 'today' ? 'Today' :
                      datePreset === 'yesterday' ? 'Yesterday' :
                      datePreset === 'last7days' ? 'Last 7 Days' : 'Date Range'
                    ) : (
                      dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Custom Range"
                      )
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col p-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <h4 className="font-medium">Date Presets</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={datePreset === 'today' ? 'default' : 'outline'}
                        onClick={() => setDatePreset('today')}
                      >
                        Today
                      </Button>
                      <Button
                        size="sm"
                        variant={datePreset === 'yesterday' ? 'default' : 'outline'}
                        onClick={() => setDatePreset('yesterday')}
                      >
                        Yesterday
                      </Button>
                      <Button
                        size="sm"
                        variant={datePreset === 'last7days' ? 'default' : 'outline'}
                        onClick={() => setDatePreset('last7days')}
                      >
                        Last 7 Days
                      </Button>
                      <Button
                        size="sm"
                        variant={datePreset === 'custom' ? 'default' : 'outline'}
                        onClick={() => setDatePreset('custom')}
                      >
                        Custom
                      </Button>
                    </div>
                  </div>
                  
                  {datePreset === 'custom' && (
                    <>
                      <Separator />
                      <div className="grid gap-2">
                        <h4 className="font-medium">Date From</h4>
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => 
                            setDateRange((prev) => ({ ...prev, from: date }))
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </div>
                      <Separator />
                      <div className="grid gap-2">
                        <h4 className="font-medium">Date To</h4>
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => 
                            setDateRange((prev) => ({ ...prev, to: date }))
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </div>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant={filterOpen ? "default" : "outline"}
              className="flex items-center gap-1"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
          
          <div className="ml-auto">
            <CsvDownloader 
              data={orders}
              filename="orders.csv"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem"
              }}
            >
              <span>Export</span>
            </CsvDownloader>
          </div>
        </div>
        
        {filterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-md border animate-in fade-in">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Score Range</h3>
              <Slider 
                defaultValue={[0, 100]} 
                max={100} 
                step={1}
                value={scoreRange}
                onValueChange={handleScoreRangeChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{scoreRange[0]}</span>
                <span>{scoreRange[1]}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tier City</h3>
              <div className="flex flex-wrap gap-1">
                {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
                  <Badge 
                    key={tier}
                    variant={selectedTierCity.includes(tier) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setSelectedTierCity(prev => toggleArrayItem(prev, tier))}
                  >
                    {tier}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Delivery Time</h3>
              <div className="flex flex-wrap gap-1">
                {['1-2 days', '3-5 days', '1 week', '2 weeks'].map(time => (
                  <Badge 
                    key={time}
                    variant={selectedDeliveryTime.includes(time) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setSelectedDeliveryTime(prev => toggleArrayItem(prev, time))}
                  >
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {['Fast Order', 'First Order', 'Second Order', 'Repeat Order', 'Past Fraud'].map(tag => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setSelectedTags(prev => toggleArrayItem(prev, tag))}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Shipment Status</h3>
              <Select value={shipmentStatusFilter} onValueChange={setShipmentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="UNFULFILLED">Unfulfilled</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                  <SelectItem value="ATTEMPTED">Attempted</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Payment Method</h3>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT">Debit</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="SHOP_PAY">Shop Pay</SelectItem>
                  <SelectItem value="APPLE_PAY">Apple Pay</SelectItem>
                  <SelectItem value="GOOGLE_PAY">Google Pay</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Risk Verification</h3>
              <Select value={riskVerificationFilter} onValueChange={setRiskVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Payment Status</h3>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                  <SelectItem value="VOIDED">Voided</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-full md:col-span-1">
              <h3 className="text-sm font-medium">Order Filters</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="flagged-orders"
                    checked={showFlagged}
                    onCheckedChange={setShowFlagged}
                  />
                  <label htmlFor="flagged-orders" className="text-sm">Show Flagged Orders Only</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="shippable-orders"
                    checked={showShippable}
                    onCheckedChange={setShowShippable}
                  />
                  <label htmlFor="shippable-orders" className="text-sm">Show Shippable Orders Only</label>
                </div>
              </div>
            </div>
            
            <div className="flex items-end gap-2 col-span-full">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setScoreRange([0, 100]);
                  setDatePreset('today');
                  setDateRange({ from: undefined, to: undefined });
                  setShowFlagged(false);
                  setShowShippable(false);
                  setShipmentStatusFilter('all');
                  setPaymentMethodFilter('all');
                  setRiskVerificationFilter('all');
                  setSelectedTierCity([]);
                  setSelectedDeliveryTime([]);
                  setSelectedTags([]);
                }}
              >
                Reset Filters
              </Button>
              <Button 
                size="sm"
                onClick={() => setFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="rounded-md border overflow-hidden w-full shadow-sm">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {Math.min(pageSize, table.getFilteredRowModel().rows.length)} of {filteredData.length} order(s)
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Show:</span>
          <Button
            variant={pageSize === 100 ? "default" : "outline"}
            size="sm"
            onClick={() => setPageSize(100)}
          >
            100
          </Button>
          <Button
            variant={pageSize === 500 ? "default" : "outline"}
            size="sm"
            onClick={() => setPageSize(500)}
          >
            500
          </Button>
          <Button
            variant={pageSize === 1000 ? "default" : "outline"}
            size="sm"
            onClick={() => setPageSize(1000)}
          >
            1000
          </Button>
        </div>
      </div>
    </div>
  )
}

export default OrdersTable;
