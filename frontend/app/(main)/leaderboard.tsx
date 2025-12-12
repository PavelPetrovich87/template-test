import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Text } from '@/components/Themed'
import { Stack } from 'expo-router'
import { useAuthStore } from '@/src/stores/authStore'
import { LeaderboardService, LeaderboardServiceError } from '@/src/services/LeaderboardService'
import {
  ILeaderboardEntry,
  ILeaderboardResponse,
  LeaderboardType,
} from '@/src/types/leaderboard'
import { useThemeColor } from '@/components/Themed'

const formatValue = (type: LeaderboardType, value: number): string => {
  switch (type) {
    case 'weekly':
      return `N-${value}`
    case 'accuracy':
      return `${value}%`
    case 'streak':
      return `${value}d`
    default:
      return String(value)
  }
}

const getTabLabel = (type: LeaderboardType): string => {
  switch (type) {
    case 'weekly':
      return 'Weekly'
    case 'accuracy':
      return 'Acc'
    case 'streak':
      return 'Strk'
    default:
      return String(type)
  }
}

export default function LeaderboardScreen() {
  const { accessToken } = useAuthStore()
  const [selectedType, setSelectedType] = useState<LeaderboardType>('weekly')
  const [leaderboard, setLeaderboard] = useState<ILeaderboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const backgroundColor = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const primaryColor = '#00ff41'
  const accentColor = '#00d4ff'

  const fetchLeaderboard = async (type: LeaderboardType): Promise<void> => {
    if (!accessToken) {
      setError('Authentication required: Please log in to view leaderboard')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await LeaderboardService.fetchLeaderboard(type, accessToken)
      setLeaderboard(data)
    } catch (err) {
      if (err instanceof LeaderboardServiceError) {
        setError(err.message)
      } else {
        setError('Failed to load leaderboard: Unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchLeaderboard(selectedType)
  }, [selectedType, accessToken])

  const handleRetry = (): void => {
    void fetchLeaderboard(selectedType)
  }

  const getDisplayEntries = (): ILeaderboardEntry[] => {
    if (!leaderboard) {
      return []
    }

    const top10 = leaderboard.entries.filter((entry) => entry.rank <= 10)
    const currentUserEntry = leaderboard.entries.find((entry) => entry.isCurrentUser)

    if (!currentUserEntry) {
      return top10
    }

    const isInTop10 = top10.some((entry) => entry.rank === currentUserEntry.rank)

    if (isInTop10) {
      return top10
    }

    return [...top10, currentUserEntry]
  }

  const displayEntries = getDisplayEntries()

  return (
    <>
      <Stack.Screen options={{ title: 'Leaderboard' }} />
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.header, { color: primaryColor }]}>GLOBAL RANKINGS</Text>

        <View style={styles.tabsContainer}>
          {(['weekly', 'accuracy', 'streak'] as LeaderboardType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.tab,
                selectedType === type && styles.tabActive,
                selectedType === type && { borderBottomColor: primaryColor },
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedType === type ? primaryColor : textColor },
                ]}
              >
                {getTabLabel(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>Loading leaderboard...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: '#ff4444' }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={[styles.retryButtonText, { color: primaryColor }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
              {displayEntries.map((entry) => (
                <View
                  key={`${entry.rank}-${entry.username}`}
                  style={[
                    styles.entryRow,
                    entry.isCurrentUser && styles.currentUserRow,
                    entry.isCurrentUser && { backgroundColor: 'rgba(0, 255, 65, 0.1)' },
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text
                      style={[
                        styles.rankText,
                        { color: entry.isCurrentUser ? primaryColor : textColor },
                      ]}
                    >
                      {entry.rank}
                    </Text>
                  </View>
                  <View style={styles.usernameContainer}>
                    <Text
                      style={[
                        styles.usernameText,
                        { color: entry.isCurrentUser ? primaryColor : textColor },
                      ]}
                    >
                      {entry.username}
                      {entry.isCurrentUser && ' (You)'}
                    </Text>
                  </View>
                  <View style={styles.valueContainer}>
                    <Text
                      style={[
                        styles.valueText,
                        { color: entry.isCurrentUser ? primaryColor : accentColor },
                      ]}
                    >
                      {formatValue(selectedType, entry.value)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.disclaimerContainer}>
              <Text style={[styles.disclaimerText, { color: textColor }]}>
                ⚠️ MVP Disclaimer: Leaderboard data is currently using mock data for testing
                purposes.
              </Text>
            </View>
          </>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#00ff41',
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
  },
  currentUserRow: {
    borderWidth: 1,
    borderColor: '#00ff41',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  usernameContainer: {
    flex: 1,
    marginLeft: 16,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 18,
  },
})
