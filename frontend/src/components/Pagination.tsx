type PaginationProps = {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange
}: PaginationProps) {

  return (
    <div className="flex justify-center items-center gap-6">

      {Array.from({ length: totalPages }, (_, index) => {

        const page = index + 1

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-full ${
              currentPage === page
                ? "bg-[#6272B6] text-white"
                : "bg-[#E5E5E5] hover:bg-[#6272B6] hover:text-white transition"
            }`}
          >
            {page}
          </button>
        )
      })}

    </div>
  )
}
