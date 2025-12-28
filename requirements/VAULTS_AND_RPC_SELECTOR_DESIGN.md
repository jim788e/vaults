# Vaults and RPC Selector Design Documentation

This document describes the design architecture and implementation details for the Vaults (staking) system and the RPC Selector component.

---

## Table of Contents

1. [Vaults Design](#vaults-design)
2. [RPC Selector Design](#rpc-selector-design)

---

## Vaults Design

### Overview

The Vaults system (Riverchurn Reserve) is a staking interface that allows users to stake $MOOZ tokens and earn WSEI rewards. The design emphasizes user experience, real-time data updates, and visual feedback.

### Architecture

#### Component Structure

```
app/vaults/page.tsx
└── components/staking/MoozVault.tsx
    ├── FallingCoins.tsx (visual effect)
    └── WalletConnect.tsx (wallet integration)
```

#### Key Components

**1. MoozVault Component** (`components/staking/MoozVault.tsx`)
- Main staking interface component
- Handles all user interactions and state management
- Integrates with Wagmi for blockchain interactions

**2. FallingCoins Component** (`components/staking/FallingCoins.tsx`)
- Visual animation effect displayed when user has staked tokens
- Creates 10 animated coins falling from top to bottom
- Uses CSS keyframe animations with random positions and delays

### User Interface Design

#### Layout Structure

1. **Hero Section**
   - Title: "Riverchurn Reserve" with gradient text (pink to cyan)
   - Subtitle explaining the staking mechanism
   - Centered, responsive typography

2. **Stats Dashboard** (Visible when wallet connected)
   - **Total Staked**: Shows total $MOOZ staked across all users
   - **Your Staked**: Displays user's personal staked amount
   - Grid layout (2 columns on desktop)

3. **WSEI Earnings Box**
   - Displays accumulated WSEI rewards
   - "Claim Rewards" button
   - Falling coins animation overlay when user has staked tokens
   - Centered card with gradient background

4. **Staking Interface**
   - **Tab System**: Toggle between "Stake" and "Withdraw"
   - **Input Field**: Integer-only input (no decimals)
   - **Max Button**: Fills input with maximum available amount
   - **Action Button**: Context-aware (Approve/Stake/Withdraw)
   - **Status Messages**: Real-time feedback for transaction states

5. **Top 5 Stakers Leaderboard**
   - Displays top stakers with rankings
   - Medal emojis for top 3 (🥇🥈🥉)
   - Color-coded borders (gold, silver, bronze)
   - Highlights current user's entry
   - Shows staked amount, percentage of total, and daily rewards
   - Refresh button with loading states
   - Links to SeiTrace explorer

6. **Admin Stats Box** (Admin-only)
   - Reward token balance
   - Reward ratio to SEI per hour
   - Visible only to configured admin wallets

### State Management

#### React State Hooks

```typescript
// Wallet & Network
- isConnected, address (from useAccount)
- chainId, isCorrectNetwork (network validation)

// Staking State
- stakeAmount: string (user input)
- activeTab: 'stake' | 'withdraw'
- actionPhase: 'idle' | 'approving' | 'staking' | 'unstaking'
- stakeStatus: 'idle' | 'pending' | 'success' | 'error'
- statusMessage: string

// Top Stakers
- topStakers: Array<{ address: string; amount: bigint }>
- isRefreshing: boolean
- refreshStatus: 'idle' | 'success' | 'error'
- refreshMessage: string

// Error Handling
- error: string | null
```

#### Blockchain Data Hooks

```typescript
// Token Balance (ERC20)
useReadContract({ balanceOf })

// Vault Data
useReadContract({ stakingTokenBalance }) // Total staked
useReadContract({ getStakeInfo }) // User's stake & rewards
useReadContract({ getRewardRatio }) // Reward calculation
useReadContract({ getRewardTokenBalance }) // Admin only
useReadContract({ getTimeUnit }) // Time unit for rewards

// Allowance (for approvals)
useReadContract({ allowance })
```

#### Transaction Hooks

```typescript
// Write Operations
useWriteContract({ approve }) // Token approval
useWriteContract({ stake }) // Staking
useWriteContract({ withdraw }) // Withdrawal
useWriteContract({ claimRewards }) // Claim rewards

// Transaction Status
useWaitForTransactionReceipt() // For all write operations
```

### Transaction Flow

#### Staking Flow

1. **Validation**
   - Check wallet connection
   - Verify correct network (Sei Mainnet)
   - Validate amount (integer, non-zero, within balance)

2. **Approval Check**
   - If allowance < amount: Request approval first
   - Set `actionPhase` to 'approving'
   - Auto-proceed to staking after approval confirmation

3. **Staking**
   - Set `actionPhase` to 'staking'
   - Call `stake()` function on vault contract
   - Wait for transaction confirmation
   - Update UI and refetch data

#### Withdrawal Flow

1. **Validation**
   - Check wallet connection
   - Verify correct network
   - Validate amount (integer, non-zero, within staked amount)

2. **Withdrawal**
   - Set `actionPhase` to 'unstaking'
   - Call `withdraw()` function on vault contract
   - Wait for transaction confirmation
   - Update UI and refetch data

#### Claim Rewards Flow

1. **Direct Action**
   - No approval needed
   - Call `claimRewards()` function
   - Wait for transaction confirmation
   - Refetch staked info to update rewards

### Visual Design Elements

#### Color Scheme

- **Primary Gradient**: Pink (`#E91E63`) to Cyan (`#00BCD4`)
- **Success States**: Green (`#22C55E`) with glow effects
- **Error States**: Red (`#EF4444`) with borders
- **Pending States**: Gradient progress bars
- **Top 3 Colors**: Gold (`#FFD700`), Silver (`#C0C0C0`), Bronze (`#CD7F32`)

#### Card Design

- Dark background with transparency (`bg-black/50`, `bg-white/5`)
- Border styling (`border-white/10`, `border-white/20`)
- Gradient overlays for special sections
- Rounded corners (`rounded-lg`, `rounded-xl`)
- Hover effects with transform animations

#### Status Indicators

- **Success**: Green background with border, checkmark icon
- **Error**: Red background with border, error message
- **Pending**: Gradient progress bar, loading spinner
- **RPC Status**: Animated pulse dot (green)

### Data Fetching & Caching

#### Top Stakers API

- **Endpoint**: `/api/top-staker`
- **Caching**: Upstash Redis (30-minute TTL)
- **Refresh Mechanism**:
  - Automatic refresh every 5 minutes
  - Manual refresh button
  - Cache invalidation on force refresh
- **Error Handling**: Graceful fallback with user feedback

#### Real-time Updates

- Automatic refetch after successful transactions
- Periodic top stakers refresh
- Wallet connection state monitoring
- Network change detection

### Admin Features

#### Admin Wallet Detection

```typescript
const adminWallets = [
  "0xf001749a67728fd0acababa1cf1d4e3ce40f4736",
  ];
```

#### Admin-Only UI

- **Admin Stats Box**: Visible only to admin wallets
- Displays:
  - Reward token balance (WSEI)
  - Reward ratio to SEI per hour
- Styled with gradient background matching site theme

### Responsive Design

#### Mobile Adaptations

- Single column layout for stats
- Full-width buttons
- Stacked input and max button
- Collapsible mobile menu in header
- Touch-friendly button sizes

#### Desktop Enhancements

- Multi-column grid layouts
- Side-by-side input and max button
- Hover effects and transitions
- Larger typography

### Error Handling

#### Validation Errors

- Wallet not connected
- Wrong network
- Insufficient balance
- Invalid amount (zero, negative, decimals)
- Loading states (data not yet available)

#### Transaction Errors

- User rejection
- Network errors
- Contract revert reasons
- Timeout handling

#### User Feedback

- Inline error messages
- Status message banners
- Disabled button states
- Loading indicators

---

## RPC Selector Design

### Overview

The RPC Selector is a user-facing component that allows switching between different RPC endpoints for the Sei Network. It provides real-time status monitoring and helps users select the most reliable connection.

### Architecture

#### Component Structure

```
components/RpcSelector.tsx
├── lib/rpc-config.ts (RPC options configuration)
└── lib/rpc-utils.ts (Status checking utilities)
```

#### Integration Points

- **Header Component**: Always visible in navigation
- **Wagmi Configuration**: Reads preference on initialization
- **LocalStorage**: Persists user selection

### User Interface Design

#### Button Design

- **Location**: Header navigation, next to wallet connect
- **Visual Style**:
  - Dark background (`bg-gray-800/50`)
  - Border with hover effects
  - Green animated pulse dot (status indicator)
  - Dropdown arrow icon
  - Responsive text ("RPC" hidden on mobile)

#### Popover Menu

- **Position**: Absolute, right-aligned, below button
- **Styling**:
  - Dark background (`bg-gray-900`)
  - Backdrop blur effect
  - Border and shadow for depth
  - Smooth transitions (fade + slide)

#### Menu Items

Each RPC option displays:

1. **Radio Button**: Visual selection indicator
2. **Provider Name**: Human-readable label
3. **Block Height**: Current chain height (if available)
4. **Status Badge**: Color-coded status (Good/Fair/Poor)
5. **Latency**: Response time in milliseconds

#### Status Indicators

- **Green ("Good")**: Latency < 500ms
- **Yellow ("Fair")**: Latency 500-1500ms
- **Red ("Poor")**: Latency > 1500ms or unreachable
- **Loading**: Pulsing gray dot while checking

### Configuration

#### RPC Options (`lib/rpc-config.ts`)

```typescript
interface RpcOption {
  name: string;
  url: string;
  isDefault?: boolean;
}
```

**Available Providers**:
1. **Public Endpoint (Default)**: `https://evm-rpc.sei-apis.com`
2. **Pocket Network**: `https://sei.api.pocket.network`
3. **StakeMe**: `https://sei-evm-rpc.stakeme.pro`

#### Default Behavior

- Default RPC is used if no preference is stored
- Selecting default removes preference from localStorage
- Page reload required to apply changes

### Status Checking Mechanism

#### Implementation (`lib/rpc-utils.ts`)

**Function**: `checkRpcStatus(url: string): Promise<RpcStatus>`

**Process**:
1. Send `eth_blockNumber` RPC call via HTTP POST
2. Measure response latency using `performance.now()`
3. Parse block height from hex response
4. Determine status based on latency thresholds
5. Return status object with metadata

**Status Calculation**:
```typescript
if (latency > 1500ms) → 'red'
else if (latency > 500ms) → 'yellow'
else → 'green'
```

**Error Handling**:
- 5-second timeout per check
- Network errors return 'red' status
- Invalid responses handled gracefully

#### Checking Strategy

- **On Menu Open**: Check all RPCs immediately
- **Periodic Updates**: Re-check every 10 seconds while menu is open
- **Parallel Execution**: All RPCs checked simultaneously using `Promise.all()`

### State Management

#### Component State

```typescript
- statuses: Record<string, RpcStatus> // Status for each RPC
- selectedUrl: string // Currently selected RPC URL
- isOpen: boolean // Popover open/closed state
```

#### Persistence

- **Storage Key**: `preferred_rpc_url`
- **Location**: `localStorage`
- **Load on Mount**: Read preference and set selected URL
- **Save on Select**: Store new preference or remove if default

### Integration with Wagmi

#### Configuration (`lib/wagmi.ts`)

**Client-Side Logic**:
1. Check `localStorage` for `preferred_rpc_url`
2. If custom RPC selected: Use HTTP transport for that URL
3. If default or no preference: Use existing WebSocket/HTTP fallback logic

**Server-Side Logic**:
- Always uses default HTTP RPC (cannot access localStorage)
- No WebSocket support (server environment limitation)

#### Transport Selection

```typescript
// Custom RPC Selected
→ viemHttp(preferredRpcUrl, { retryCount: 3, retryDelay: 1000 })

// Default RPC
→ WebSocket with HTTP fallback (original logic)
```

#### Page Reload Requirement

- **Why**: Wagmi config is initialized at app startup
- **When**: After selecting a new RPC
- **Method**: `window.location.reload()`
- **User Experience**: Smooth transition with state preservation

### User Interaction Flow

#### Selection Flow

1. User clicks RPC button → Menu opens
2. Status checks run automatically
3. User sees real-time status for all RPCs
4. User clicks desired RPC option
5. Selection saved to localStorage
6. Page reloads automatically
7. Wagmi reinitializes with new RPC
8. User continues with new connection

#### Visual Feedback

- **Selected State**: Blue highlight, filled radio button
- **Hover State**: Background color change
- **Status Updates**: Real-time badge and latency updates
- **Loading State**: Pulsing indicator while checking

### Error Handling

#### Network Errors

- Failed RPC checks show 'Poor' status
- Error messages logged to console
- User can still select unreachable RPCs (may fail on use)

#### Storage Errors

- `localStorage` access wrapped in try-catch
- Falls back to default if storage unavailable
- No user-facing error (graceful degradation)

#### Timeout Handling

- 5-second timeout per status check
- AbortController for request cancellation
- Timeout treated as 'Poor' status

### Performance Considerations

#### Optimization Strategies

- **Lazy Checking**: Only check when menu is open
- **Parallel Requests**: All RPCs checked simultaneously
- **Interval Management**: Clear interval on menu close
- **Request Cancellation**: AbortController for timeouts

#### Resource Usage

- Minimal impact when menu closed
- HTTP requests only during status checks
- No persistent connections
- Efficient state updates

### Accessibility

#### Keyboard Navigation

- Popover accessible via keyboard
- Tab navigation through options
- Enter/Space to select
- Escape to close

#### Screen Reader Support

- Semantic HTML structure
- ARIA labels where needed
- Status announcements for status changes

### Mobile Considerations

#### Responsive Design

- Button text hidden on small screens (icon only)
- Popover adapts to screen width
- Touch-friendly button sizes
- Mobile menu integration in Header

#### Mobile Menu Integration

- RPC selector also appears in mobile menu
- Same functionality as desktop
- Consistent styling across breakpoints

---

## Design Principles

### Consistency

- Both components follow the site's dark theme
- Gradient colors (pink to cyan) used consistently
- Card-based layouts with similar styling
- Smooth transitions and animations

### User Experience

- Clear visual feedback for all actions
- Real-time status updates
- Error messages are user-friendly
- Loading states prevent confusion

### Performance

- Efficient data fetching strategies
- Caching where appropriate
- Minimal re-renders
- Optimized animations

### Maintainability

- Modular component structure
- Clear separation of concerns
- TypeScript for type safety
- Comprehensive error handling

---

## Future Enhancements

### Vaults

- Historical staking charts
- Reward history tracking
- Batch operations support
- Advanced filtering for leaderboard

### RPC Selector

- Custom RPC URL input
- RPC performance history
- Automatic failover
- Connection quality metrics

---
## Components

### 1. MoozVault Component

**Location**: `components/staking/MoozVault.tsx`

**Purpose**: Main vault interface component

**Key Features**:
- Wallet connection
- Token balance display
- Stake/Withdraw interface with tabs
- Top 5 stakers leaderboard
- WSEI earnings display with claim button
- Admin stats panel (admin only)
- Background image with overlay
- Responsive design

**State Management**:
- `stakeAmount`: User input for stake/withdraw amount
- `activeTab`: 'stake' | 'withdraw'
- `showStakeModal`: Boolean for stake modal
- `showUnstakeModal`: Boolean for unstake modal
- `topStakers`: Array of top staker data
- `isRefreshing`: Loading state for top stakers refresh
- `stakeStatus`: Transaction status ('idle' | 'pending' | 'success' | 'error')

**Contract Reads**:
- `tokenBalance`: User's $MOOZ balance (ERC20)
- `totalStaked`: Total tokens staked in vault
- `stakedInfo`: User's staking info [amountStaked, unclaimedRewards]
- `allowance`: Token approval amount
- `rewardRatio`: Reward ratio [numerator, denominator]
- `rewardTokenBalance`: WSEI balance in vault
- `timeUnit`: Time unit for rewards

### 2. MoozStakingModal Component

**Location**: `components/staking/MoozStakingModal.tsx`

**Purpose**: Modal for handling stake/unstake transactions

**Features**:
- Two-step approval process for staking (Approve → Stake)
- Single-step for unstaking
- Success screen with auto-close countdown
- Error handling and display
- Discord notifications for large transactions
- Spam detection

**Props**:
```typescript
interface MoozStakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "stake" | "unstake";
  amount: string;
  tokenBalance: bigint | null;
  onSuccess: () => void;
}
```

### 3. FallingCoins Component

**Location**: `components/staking/FallingCoins.tsx`

**Purpose**: Animated falling coins effect shown when user has staked tokens

**Features**:
- 10 animated coins
- Random positions and delays
- CSS keyframe animations
- Only displays when user has staked tokens
**environment variables**: 
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=0xf61Bd4a5D34BCEeFdcB1534f17eFafe7B9c2F92B
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0x65856bb190955c72d4fd9b1b5700b29067018492
KV_REST_API_URL=https://sweet-chow-19484.upstash
KV_REST_API_TOKEN=AUwcAAIncDE5ZTU4OWJjOTdjNDE0NjEzYWUyZTAzYzQ1M2I5NTk2N3AxMTk0ODQ