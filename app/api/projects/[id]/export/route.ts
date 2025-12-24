import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

/**
 * GET /api/projects/[id]/export
 * Export project BQ to Excel with one sheet per section and a summary sheet
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  try {
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get sections
    const { data: sections } = await supabase
      .from('project_sections')
      .select('*')
      .eq('project_id', params.id)
      .order('sort_order', { ascending: true })

    // Get BQ items with section info
    const { data: bqItems } = await supabase
      .from('bill_of_quantities')
      .select(`
        *,
        nrm_rules(content, unit, path),
        project_sections(id, name, code, color_hex)
      `)
      .eq('project_id', params.id)
      .order('section_id', { ascending: true, nullsFirst: false })
      .order('sort_order', { ascending: true })

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'NRM2 Tender App'
    workbook.created = new Date()
    workbook.modified = new Date()

    // Helper function to format currency
    const formatCurrency = (value: number | null) => {
      if (value === null || value === undefined) return '£0.00'
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(value)
    }

    // Helper function to create a section sheet
    const createSectionSheet = (
      sheetName: string,
      items: any[],
      sectionColor?: string | null
    ) => {
      const sheet = workbook.addWorksheet(sheetName, {
        pageSetup: {
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      })

      // Header row
      const headerRow = sheet.addRow([
        'Item',
        'Description',
        'Quantity',
        'Unit',
        'Rate (£)',
        'Amount (£)',
      ])

      // Style header
      headerRow.font = { bold: true, size: 11 }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: sectionColor ? sectionColor.replace('#', 'FF') : 'FF3B82F6' },
      }
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
      headerRow.height = 20

      // Set column widths
      sheet.getColumn(1).width = 15 // Item
      sheet.getColumn(2).width = 50 // Description
      sheet.getColumn(3).width = 12 // Quantity
      sheet.getColumn(4).width = 10 // Unit
      sheet.getColumn(5).width = 15 // Rate
      sheet.getColumn(6).width = 15 // Amount

      let sectionTotal = 0

      // Add items
      items.forEach((item: any) => {
        const amount = item.amount || 0
        sectionTotal += Number(amount)

        const row = sheet.addRow([
          item.nrm_rules?.path || '',
          item.description_custom || item.nrm_rules?.content || '',
          item.quantity || 0,
          item.unit || '',
          item.rate || 0,
          amount,
        ])

        // Format number columns
        row.getCell(3).numFmt = '#,##0.0000' // Quantity
        row.getCell(5).numFmt = '#,##0.00' // Rate
        row.getCell(6).numFmt = '#,##0.00' // Amount

        row.getCell(5).alignment = { horizontal: 'right' }
        row.getCell(6).alignment = { horizontal: 'right' }
      })

      // Add total row
      const totalRow = sheet.addRow([
        '',
        'SECTION TOTAL',
        '',
        '',
        '',
        sectionTotal,
      ])

      totalRow.font = { bold: true, size: 11 }
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      }
      totalRow.getCell(6).numFmt = '#,##0.00'
      totalRow.getCell(6).alignment = { horizontal: 'right' }
      totalRow.height = 20

      // Add borders to all cells
      sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
      })

      return sectionTotal
    }

    // Group items by section
    const groupedData: any = {
      unsectioned: [],
      sections: new Map(),
    }

    bqItems?.forEach((item: any) => {
      if (!item.project_sections) {
        groupedData.unsectioned.push(item)
      } else {
        const sectionId = item.project_sections.id
        if (!groupedData.sections.has(sectionId)) {
          groupedData.sections.set(sectionId, {
            section: item.project_sections,
            items: [],
          })
        }
        groupedData.sections.get(sectionId).items.push(item)
      }
    })

    const sectionTotals: Array<{ name: string; total: number }> = []
    let projectTotal = 0

    // Create a sheet for each section
    sections?.forEach((section) => {
      const sectionData = groupedData.sections.get(section.id)
      if (sectionData && sectionData.items.length > 0) {
        // Clean sheet name (Excel has restrictions)
        const sheetName = section.name.substring(0, 31).replace(/[\\\/\?\*\[\]]/g, '_')
        const total = createSectionSheet(sheetName, sectionData.items, section.color_hex)
        sectionTotals.push({ name: section.name, total })
        projectTotal += total
      }
    })

    // Create sheet for unsectioned items if any
    if (groupedData.unsectioned.length > 0) {
      const total = createSectionSheet('General Items', groupedData.unsectioned)
      sectionTotals.push({ name: 'General Items', total })
      projectTotal += total
    }

    // Create Summary sheet
    const summarySheet = workbook.addWorksheet('Project Summary', {
      pageSetup: {
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    })

    // Project header
    summarySheet.addRow([project.name])
    summarySheet.getRow(1).font = { bold: true, size: 16 }
    summarySheet.getRow(1).height = 25

    summarySheet.addRow([`Project Code: ${project.code || 'N/A'}`])
    summarySheet.getRow(2).font = { size: 12 }
    summarySheet.addRow([`Exported: ${new Date().toLocaleDateString('en-GB')}`])
    summarySheet.getRow(3).font = { size: 12 }
    summarySheet.addRow([]) // Empty row

    // Summary table header
    const summaryHeader = summarySheet.addRow(['Section', 'Total Amount (£)'])
    summaryHeader.font = { bold: true, size: 11 }
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' },
    }
    summaryHeader.alignment = { horizontal: 'center', vertical: 'middle' }
    summaryHeader.height = 20

    // Set column widths
    summarySheet.getColumn(1).width = 40
    summarySheet.getColumn(2).width = 20

    // Add section totals
    sectionTotals.forEach(({ name, total }) => {
      const row = summarySheet.addRow([name, total])
      row.getCell(2).numFmt = '#,##0.00'
      row.getCell(2).alignment = { horizontal: 'right' }
    })

    // Add project total
    summarySheet.addRow([]) // Empty row
    const projectTotalRow = summarySheet.addRow(['PROJECT TOTAL', projectTotal])
    projectTotalRow.font = { bold: true, size: 12 }
    projectTotalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    }
    projectTotalRow.getCell(2).numFmt = '#,##0.00'
    projectTotalRow.getCell(2).alignment = { horizontal: 'right' }
    projectTotalRow.height = 25

    // Add borders to summary sheet
    summarySheet.eachRow((row, rowNumber) => {
      if (rowNumber > 4) {
        // Skip header rows
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
      }
    })

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${project.code || 'project'}-BQ-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
