import { NextRequest, NextResponse } from 'next/server'
import { createAdminHandler } from '@/lib/auth-middleware'
import { DataConsistencyService } from '@/lib/data-consistency-service'
import { logger } from '@/lib/backend/monitoring/logger'

// GET /api/admin/data-consistency - Check data consistency
export const GET = createAdminHandler(async () => {
  try {
    logger.info('[DataConsistency API] Starting consistency check...')

    const report = await DataConsistencyService.runFullConsistencyCheck()

    return NextResponse.json({
      success: true,
      report,
      summary: DataConsistencyService.generateSummaryReport(report),
    })
  } catch (error) {
    logger.error(
      { error },
      '[DataConsistency API] Error checking consistency'
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check data consistency',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

// POST /api/admin/data-consistency - Clean up data inconsistencies
export const POST = createAdminHandler(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const {
      deleteOrphanedImages = false,
      fixMissingReferences = false,
      dryRun = true,
    } = body

    logger.info('[DataConsistency API] Starting cleanup...', {
      deleteOrphanedImages,
      fixMissingReferences,
      dryRun,
    })

    const result = await DataConsistencyService.cleanup({
      deleteOrphanedImages,
      fixMissingReferences,
      dryRun,
    })

    return NextResponse.json({
      success: true,
      result,
      message: dryRun
        ? 'Dry run completed - no changes made'
        : 'Cleanup completed successfully',
    })
  } catch (error) {
    logger.error(
      { error },
      '[DataConsistency API] Error during cleanup'
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clean up data inconsistencies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})