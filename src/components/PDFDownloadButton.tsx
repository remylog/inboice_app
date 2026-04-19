"use client";

import { useState } from "react";

type PDFDownloadButtonProps = {
	targetId: string;
	createdAt: string;
};

function toFileDate(value: string) {
	const source = value?.slice(0, 10) || new Date().toISOString().slice(0, 10);
	return source.replaceAll("-", "");
}

export default function PDFDownloadButton({ targetId, createdAt }: PDFDownloadButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleDownload = async () => {
		if (isLoading) {
			return;
		}

		const target = document.getElementById(targetId);
		if (!target) {
			return;
		}

		setIsLoading(true);

		try {
			const mod = (await import("html2pdf.js")) as unknown as {
				default?: any;
			};
			const html2pdf = mod.default;

			if (!html2pdf) {
				throw new Error("html2pdf.js の読み込みに失敗しました");
			}

			const pdfMarginMm = 8;
			const contentWidthMm = 210 - pdfMarginMm * 2;

			const clone = target.cloneNode(true) as HTMLElement;
			clone.style.margin = "0";
			clone.style.maxWidth = `${contentWidthMm}mm`;
			clone.style.width = "100%";
			clone.style.aspectRatio = "auto";
			clone.style.height = "auto";

			for (const node of clone.querySelectorAll(".receipt-actions, [data-pdf-exclude='true']")) {
				node.remove();
			}

			const wrapper = document.createElement("div");
			wrapper.style.position = "fixed";
			wrapper.style.left = "-100000px";
			wrapper.style.top = "0";
			wrapper.style.width = `${contentWidthMm}mm`;
			wrapper.style.background = "#ffffff";
			wrapper.appendChild(clone);
			document.body.appendChild(wrapper);

			try {
				await html2pdf()
					.set({
						margin: [pdfMarginMm, pdfMarginMm, pdfMarginMm, pdfMarginMm],
						filename: `invoice-${toFileDate(createdAt)}.pdf`,
						image: { type: "jpeg", quality: 0.98 },
						html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
						jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
						pagebreak: { mode: ["css", "legacy"] }
					})
					.from(clone)
					.save();
			} finally {
				document.body.removeChild(wrapper);
			}
		} catch {
			// 失敗時は静かに終了し、UI崩れを防ぐ
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			type="button"
			className="button primary"
			onClick={() => void handleDownload()}
			disabled={isLoading}
		>
			{isLoading ? "生成中..." : "PDFダウンロード"}
		</button>
	);
}
